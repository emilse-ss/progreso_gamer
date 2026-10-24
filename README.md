# Diario de Progreso Gamer

Aplicación web para llevar el control de los videojuegos que posees, las sesiones que juegas de cada uno y un resumen calculado de tu progreso real.

**URLs públicas (Render)**

| Servicio | URL |
| Frontend | pendiente |
| Backend (API) | pendiente |
| Health check | _`<URL del backend>/api/health`_ |

---

## 1. Intención del proyecto

La aplicación responde una pregunta simple: "¿qué estoy jugando ahora, cuánto le he dedicado y qué tan avanzado voy?"

- **Videojuego:** la ficha de cada juego (nombre, plataforma, género, estado) con su lista de logros.
- **Partida:** una sesión de juego registrada (fecha, duración y avance al terminar). No es una campaña ni un archivo de guardado independiente.
- **Resumen:** el backend calcula, a partir de las partidas de un juego, las horas totales, la cantidad de sesiones, la fecha de la última y el avance actual. El frontend solo lo muestra.

---

## 2. Arquitectura

```text
diario-gamer/
├── docs/
│   ├── ARQUITECTURA.md            Plano del backend de referencia (agnóstico del dominio)
│   └── ARQUITECTURA-FRONTEND.md   Plano del frontend de referencia
├── backend/
│   └── src/
│       ├── config/                Lectura y validación de variables de entorno
│       ├── middlewares/           requestId, logger, 404 y errorHandler
│       ├── routes/                Endpoints → controladores
│       ├── controllers/           Adaptación HTTP ↔ servicios
│       ├── services/              Reglas de negocio y resumen calculado
│       └── modelos/               Esquemas Mongoose
└── frontend/
    └── src/
        ├── api/                   Cliente HTTP común y servicios por recurso
        ├── components/            Navegación y componentes reutilizables (ui/)
        └── paginas/               Pantallas
```

Flujo de una petición: `ruta → middlewares → controlador → servicio → modelo → MongoDB Atlas`.

**Stack:** Node.js, Express, TypeScript, Mongoose, MongoDB Atlas, React, Vite, React Router y Bootstrap.

---

## 3. Modelo de datos y justificación

### Videojuego

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | string | Obligatorio, con `trim` |
| `plataforma` | enum | `PC` · `PlayStation` · `Xbox` · `Switch` · `Movil` |
| `genero` | enum | `accion` · `rol` · `estrategia` · `puzzle` · `deportes` · `otro` |
| `estado` | enum | `jugando` · `pausado` · `completado` · `abandonado` |
| `logros` | **embebido** `[{ _id, nombre, obtenido }]` | `nombre` obligatorio, `obtenido` inicia en `false`, máximo 50 |
| `createdAt`, `updatedAt` | Date | Timestamps automáticos |

### Partida

| Campo | Tipo | Regla |
| `videojuego` | ObjectId, `ref: "Videojuego"` | **Referenciado**; obligatorio y verificado en el servicio (404 si no existe) |
| `fecha` | Date | Obligatoria |
| `duracionMinutos` | number | Obligatoria y **mayor que cero** |
| `porcentajeAvance` | number | Opcional en el backend, entre 0 y 100 |
| `notas` | string | Opcional |
| `createdAt`, `updatedAt` | Date | Timestamps automáticos |

### Por qué `logros` se embebe y `Partida` se referencia

| `logros` **embebido** en Videojuego | Se lee siempre junto con el juego, no tiene entidad propia fuera de él y es una lista corta y acotada (máx. 50). Embeberlo evita una segunda consulta y mantiene los logros atados a su juego. |
| `Partida` **referenciada** | Crece sin límite (sesiones semanales durante meses) y se consulta también de forma independiente ("todas mis partidas"). Embeberla haría crecer el documento del juego indefinidamente. |
| Resumen calculado en el backend | La lógica de negocio no se repite en cada cliente de la API; vive en la capa de servicio y siempre refleja las partidas actuales porque no se guarda, se calcula. |

### Reglas de validación y su justificación

| Regla | Dónde | Justificación |
| `nombre` obligatorio y con `trim` | Esquema y controlador | Sin nombre la ficha no es identificable; el `trim` evita nombres de solo espacios. |
| `videojuego` obligatorio en Partida | Esquema y servicio | Una sesión huérfana no tiene sentido; el servicio comprueba que el juego exista porque `ref` por sí solo no lo garantiza. |
| `duracionMinutos` > 0 | Esquema y controlador | Una sesión de 0 minutos no es una sesión y distorsiona `horasTotales`. |
| `porcentajeAvance` entre 0 y 100 | Esquema y controlador | Es un porcentaje; fuera de ese rango rompería el "avance actual". |
| `plataforma`, `genero`, `estado` con valores cerrados | `enum` | Evita variantes como "pc" o "PC " y hace fiables los filtros. |
| Logros acotados a 50 y sin catálogos externos | Servicio | Es una lista corta que viaja con el juego; el usuario escribe sus propios logros. |
| Ids validados antes de consultar | Controladores y errorHandler | Un id mal formado responde 400 en lugar de un error interno. |

---

## 4. Resumen calculado (fórmula)

`GET /api/videojuegos/:id/resumen` se calcula en la capa de servicio a partir de todas las partidas del videojuego:

| Campo | Fórmula |
| `totalPartidas` | Cantidad de partidas del videojuego |
| `horasTotales` | `suma(duracionMinutos) / 60`, redondeada a 1 decimal |
| `ultimaPartida` | `fecha` más reciente (se usa `fecha`, no `createdAt`, porque se pueden registrar sesiones de días anteriores) |
| `porcentajeAvanceActual` | `porcentajeAvance` de esa partida más reciente |

Ejemplo de respuesta (más `requestId` en el nivel superior):

```json
{
  "totalPartidas": 8,
  "horasTotales": 14.5,
  "ultimaPartida": "2026-10-02T00:00:00.000Z",
  "porcentajeAvanceActual": 67,
  "requestId": "<id>"
}
```

**Casos límite**

- **Sin partidas:** `totalPartidas: 0`, `horasTotales: 0`, `ultimaPartida: null`, `porcentajeAvanceActual: 0`.
- **Videojuego inexistente:** 404.
- **La partida más reciente no trae avance:** `porcentajeAvanceActual` es 0.

**El avance es acumulado.** `porcentajeAvance` es el punto en el que quedaste **al terminar esa sesión**, no lo que avanzaste en ella (sesión 1 → 30 %, sesión 2 → 45 %). Por eso el resumen toma el de la última partida en lugar de sumarlos. Lo único que se suma es la duración. El formulario de partida lo aclara con su etiqueta y texto de ayuda.

**Decisión sobre el avance opcional:** _completa con la opción que elegiste (A: obligatorio en el formulario; B: el servicio usa el avance de la última partida que sí lo tenga; C: se deja como está) y su justificación._

---

## 5. Política de eliminación

- **Eliminar un Videojuego** elimina también, en cascada, todas sus Partidas (en el servicio). Las partidas no tienen sentido sin su juego y dejarlas huérfanas rompería el `populate` y los listados.
- **Eliminar una Partida** borra únicamente esa sesión; el resumen se recalcula en la siguiente consulta.
- Un `DELETE` sobre un videojuego inexistente responde 404 sin tocar la colección de partidas.
- El frontend pide confirmación antes de borrar un videojuego y avisa de la cascada.
- **Alternativa descartada:** impedir el borrado de juegos con partidas (409). Es más segura, pero obliga al usuario a borrar sesión por sesión.

---

## 6. API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/videojuegos` | Lista; filtros opcionales `plataforma`, `genero`, `estado` (vacíos se ignoran; fuera del enum → 400) |
| GET | `/api/videojuegos/:id` | Detalle |
| POST | `/api/videojuegos` | Crear |
| PUT / PATCH | `/api/videojuegos/:id` | Actualizar |
| DELETE | `/api/videojuegos/:id` | Eliminar (con cascada) |
| POST | `/api/videojuegos/:id/logros` | Agregar logro |
| PATCH | `/api/videojuegos/:id/logros/:logroId` | Actualizar nombre y/o `obtenido` |
| DELETE | `/api/videojuegos/:id/logros/:logroId` | Eliminar logro |
| GET | `/api/videojuegos/:id/partidas` | Partidas de un videojuego |
| GET | `/api/videojuegos/:id/resumen` | **Resumen calculado** |
| GET | `/api/partidas` | Lista con `populate("videojuego")` |
| POST | `/api/partidas` | Crear (verifica que el videojuego exista) |
| DELETE | `/api/partidas/:id` | Eliminar una partida |

**Formato de respuestas:** las exitosas con cuerpo incluyen `_id` y `requestId`; los listados incluyen `total`; la eliminación de recursos principales responde sin cuerpo (204) y la de un logro devuelve el videojuego actualizado.

**Operaciones sobre logros embebidos:** el servicio carga el Videojuego, modifica el subdocumento y guarda el documento padre con `save()` para que se ejecuten las validaciones del esquema.

### Manejo de errores

| Tipo | Cómo se reconoce | HTTP | Cuerpo |
|---|---|---:|---|
| Validación de esquema | `ValidationError` o validación de entrada; JSON mal formado | 400 | `{ "error", "requestId" }` |
| Id mal formado | `CastError` o validación previa | 400 | `{ "error", "requestId" }` |
| Recurso o referencia inexistente | `ApiError` con estado 404 | 404 | `{ "error", "requestId" }` |
| Error inesperado | Cualquier otro; se registra en el servidor sin exponer detalles | 500 | `{ "error": "Error interno del servidor", "requestId" }` |

---

## 7. Cambios y mejoras respecto a la arquitectura de referencia

El proyecto replica la estructura, el orden de capas y el manejo de errores del proyecto de referencia (documentados en `docs/ARQUITECTURA.md` y `docs/ARQUITECTURA-FRONTEND.md`). Estas son las diferencias deliberadas:

### Backend

| Referencia | Este proyecto | Motivo |
|---|---|---|
| Orden: CORS → JSON → `requestId` → logger | `requestId` → logger → CORS → JSON | Un error de JSON mal formado ahora también lleva `requestId` y queda registrado. |
| Un JSON mal formado caía como error inesperado | Responde **400** | Es un error del cliente, no del servidor. |
| Sin `CORS_ORIGIN` | Variable nueva: obligatoria en producción, `http://localhost:5173` por defecto en desarrollo | CORS correcto entre dos servicios desplegados, sin dejar localhost en producción por descuido. |
| Sin patrón para subdocumentos embebidos | Operaciones de logros en el servicio: cargar padre, modificar y `save()` | Mantiene las validaciones del esquema y el límite de 50. |
| Referencia sin entidad hija que limpiar | Cascada de Partidas al eliminar un Videojuego | Evita partidas huérfanas. |
| Sin endpoint calculado | `GET /api/videojuegos/:id/resumen` en el servicio | Nueva lógica de negocio centralizada. |

### Frontend

| Referencia | Este proyecto | Motivo |
|---|---|---|
| Lógica `fetch` duplicada en cada módulo de API | Cliente HTTP común en `api/` con tipo de error propio | Una sola implementación para 204, errores `{ error, requestId }` y fallos de red. |
| `VITE_API_URL` opcional (cadena vacía) | Obligatoria: la app falla con mensaje claro si falta | Evita despliegues apuntando a un origen equivocado sin avisar. |
| Sin página 404 | Ruta comodín con página propia | Direcciones inexistentes muestran una vista de error diseñada. |
| Selector de entidad referenciada solo en el alta | `SelectorVideojuego` reutilizable que envía el `_id` | El usuario nunca escribe un ObjectId; llega prellenado desde el detalle. |
| Sin edición de subdocumentos | Agregar, marcar y quitar logros desde el detalle | Cubre la operación sobre el subdocumento embebido. |
| Sin validación de rangos en cliente | Validación espejo del backend (duración > 0, avance 0–100, máx. 50 logros) | Mejor experiencia; los errores del servidor se muestran igualmente. |

---


## 8. Incidencias y soluciones

| Incidencia | Solución |
|---|---|
| `ApiError` sin exportación por defecto | Se corrigieron los imports para usar la exportación nombrada. |
| Listado vacío sin filtros | Se enviaban propiedades `undefined` a la consulta de Mongoose. El servicio ahora construye el filtro solo con valores definidos y no vacíos, y valida los filtros contra sus enums. |
| JSON mal formado con `curl.exe` en PowerShell | El escape de comillas inline producía peticiones inválidas. Se escribe el JSON en un archivo UTF-8 sin BOM y se envía con `--data-binary @archivo`. |
| Rutas nuevas no visibles en un servidor ya ejecutado | Hay que reiniciar el backend para cargar la versión compilada. |

---

## 12. Demo

!!! pendiente

Flujo mostrado: crear un videojuego → registrar partidas → ver el resumen actualizarse → marcar un logro.
