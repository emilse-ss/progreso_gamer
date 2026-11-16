# Diario de Progreso Gamer

Aplicación web para llevar el control de los videojuegos que posees, las sesiones que juegas de cada uno, un resumen calculado de tu progreso real y, desde la épica E2, **metas semanales, rachas e hitos**.

**URLs públicas (Render)**

| Servicio      | URL                                                      |
| ------------- | -------------------------------------------------------- |
| Frontend      | https://progresogamer-app-emilse.onrender.com            |
| Backend (API) | https://progresogamer-api-emilse.onrender.com            |
| Health check  | https://progresogamer-api-emilse.onrender.com/api/health |

---

## 1. Intención del proyecto

La aplicación responde una pregunta simple: «¿qué estoy jugando ahora, cuánto le he dedicado, qué tan avanzado voy y estoy cumpliendo lo que me propuse esta semana?»

- **Videojuego:** la ficha de cada juego (nombre, plataforma, género, estado) con su lista de logros.
- **Partida:** una sesión de juego registrada (fecha y hora, duración y avance al terminar). No es una campaña ni un archivo de guardado independiente.
- **Resumen:** el backend calcula, a partir de las partidas de un juego, las horas totales, la cantidad de sesiones, la fecha de la última y el avance actual. El frontend solo lo muestra.
- **Meta semanal (E2):** horas por semana, días por semana y hasta 5 hitos de avance para un videojuego. El backend calcula el **progreso de la semana** (horas, días jugados, racha actual, mejor racha, hitos alcanzados y si la meta se cumplió).

---

## 2. Arquitectura

```text
diario-gamer/
├── AGENTS.md / CLAUDE.md / DESIGN.md   Harness del agente y sistema de diseño (sección 11)
├── docs/                               Diagnóstico, PRD, backlog, specs, auditoría y evidencia
├── backend/
│   └── src/
│       ├── config/                     Lectura y validación de variables de entorno
│       ├── middlewares/                requestId, logger, 404 y errorHandler
│       ├── routes/                     Endpoints → controladores
│       ├── controllers/                Adaptación HTTP ↔ servicios (forma del cuerpo)
│       ├── services/                   Reglas de negocio, resumen y progreso semanal
│       ├── dominio/                    Funciones puras de E2: semana, racha, hitos, cumplimiento, partida
│       └── modelos/                    Esquemas Mongoose
└── frontend/
    └── src/
        ├── api/                        Cliente HTTP común y servicios por recurso
        ├── components/                 Componentes de página y reutilizables (ui/)
        ├── paginas/                    Pantallas
        └── utils/                      Formato de fechas en hora de Ecuador
```

Flujo de una petición: `ruta → middlewares → controlador → servicio → modelo → MongoDB Atlas`. En el progreso semanal, el servicio consulta las partidas y la meta, y le pasa los datos al **dominio** junto con «ahora».

**Stack:** Node.js 20 o superior, Express 4, TypeScript, Mongoose 8, MongoDB Atlas, React 18, Vite 6, React Router 6, CSS propio con tokens (más Bootstrap limitado a la base y los formularios, según `DESIGN.md`) y Vitest para los tests del backend.

---

## 3. Modelo de datos y justificación

### Videojuego

| Campo                    | Tipo                                       | Regla                                                            |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| `nombre`                 | string                                     | Obligatorio, con `trim`                                          |
| `plataforma`             | enum                                       | `PC` · `PlayStation` · `Xbox` · `Switch` · `Movil`               |
| `genero`                 | enum                                       | `accion` · `rol` · `estrategia` · `puzzle` · `deportes` · `otro` |
| `estado`                 | enum                                       | `jugando` · `pausado` · `completado` · `abandonado`              |
| `logros`                 | **embebido** `[{ _id, nombre, obtenido }]` | `nombre` obligatorio, `obtenido` inicia en `false`, máximo 50    |
| `createdAt`, `updatedAt` | Date                                       | Timestamps automáticos                                           |

### Partida

| Campo                    | Tipo                          | Regla                                                                                                                         |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `videojuego`             | ObjectId, `ref: "Videojuego"` | **Referenciado**; obligatorio y verificado en el servicio (404 si no existe)                                                  |
| `fecha`                  | Date                          | Obligatoria. En la API, texto ISO **con hora y zona** (`Z` o `±hh:mm`) y de un día no posterior a hoy en Ecuador (D-10, D-02) |
| `duracionMinutos`        | number                        | Obligatoria, **de 5 a 1440** minutos (D-10). Las partidas antiguas fuera de ese rango se conservan                            |
| `porcentajeAvance`       | number                        | Obligatorio en las partidas nuevas (D-03), entre 0 y 100. Las partidas antiguas sin avance se conservan                       |
| `notas`                  | string                        | Opcional                                                                                                                      |
| `createdAt`, `updatedAt` | Date                          | Timestamps automáticos                                                                                                        |

### Meta (E2)

| Campo                    | Tipo                                                            | Regla                                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `videojuego`             | ObjectId, `ref: "Videojuego"`                                   | **Referenciado**; obligatorio y verificado en el servicio. No se puede cambiar al editar                                                                 |
| `horasSemanales`         | number                                                          | Entero de 1 a 100 (R-12)                                                                                                                                 |
| `diasPorSemana`          | number                                                          | Entero de 1 a 7 (R-12)                                                                                                                                   |
| `hitos`                  | **embebido** `[{ descripcion, porcentajeObjetivo }]`, sin `_id` | De 0 a 5. `porcentajeObjetivo` entero de 1 a 100, sin repetir; `descripcion` obligatoria, con `trim`, máximo 100 caracteres. Se guardan ordenados (R-16) |
| `activa`                 | boolean                                                         | `true` al crear. Como máximo **una meta activa por videojuego** (R-13), garantizado también con un índice único parcial                                  |
| `createdAt`, `updatedAt` | Date                                                            | Timestamps automáticos                                                                                                                                   |

### Por qué cada relación se modela así

| Decisión                                      | Justificación                                                                                                                                                                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logros` **embebido** en Videojuego           | Se lee siempre junto con el juego, no tiene entidad propia fuera de él y es una lista corta y acotada (máx. 50). Embeberlo evita una segunda consulta y mantiene los logros atados a su juego.                                                                 |
| `Partida` **referenciada**                    | Crece sin límite (sesiones semanales durante meses) y se consulta también de forma independiente («todas mis partidas»). Embeberla haría crecer el documento del juego indefinidamente.                                                                        |
| `Meta` **referenciada** (colección propia)    | Un juego acumula un historial de metas (las inactivas no se borran, R-15) y cada meta se consulta, edita, desactiva y reactiva por su `_id`. Además, la regla «una sola activa por videojuego» se apoya en un índice único parcial, que vive en una colección. |
| `hitos` **embebidos** en Meta                 | Son a lo sumo 5, no tienen identidad propia y se editan siempre como lista completa junto con la meta.                                                                                                                                                         |
| «Alcanzado», racha y semana **no se guardan** | Se calculan en cada consulta (R-17), así nunca se desincronizan de las partidas.                                                                                                                                                                               |
| Resumen y progreso calculados en el backend   | La lógica de negocio no se repite en cada cliente de la API; vive en el servicio y en el dominio, y siempre refleja las partidas actuales.                                                                                                                     |

### Reglas de validación y su justificación

Convención de capas (D-07): la **forma del cuerpo** en el controlador; existencia, unicidad y reglas de negocio en el **servicio** (o en el dominio, que el servicio llama); **rangos** en el esquema. Las actualizaciones usan `runValidators: true` (D-08).

| Regla                                                 | Dónde                                                                        | Justificación                                                                                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nombre` obligatorio y con `trim`                     | Esquema y controlador                                                        | Sin nombre la ficha no es identificable; el `trim` evita nombres de solo espacios.                                                                                |
| `videojuego` obligatorio en Partida y en Meta         | Esquema y servicio                                                           | Una sesión o una meta huérfana no tiene sentido; el servicio comprueba que el juego exista porque `ref` por sí solo no lo garantiza.                              |
| `duracionMinutos` de 5 a 1440                         | Servicio (dominio `validarPartidaNueva`) y esquema                           | Menos de 5 minutos no es una sesión; más de 1440 (un día entero) es un error de captura que distorsiona `horasTotales`, `horasSemana` y la racha (R-22).          |
| `fecha` con hora y zona                               | Controlador (`fechaConHoraYZona`)                                            | Sin hora, `"2026-11-10"` se interpreta como `00:00Z`, que en Ecuador es el **día anterior** a las 19:00 (D-02). El formulario envía la hora escrita con `-05:00`. |
| `fecha` no posterior a hoy (Ecuador)                  | Servicio (dominio `validarPartidaNueva`, con «ahora» inyectado)              | Una sesión futura inflaría la semana y la racha. Se acepta una de hoy aunque su hora sea posterior a la actual (R-22).                                            |
| `porcentajeAvance` obligatorio y entre 0 y 100        | Esquema y controlador                                                        | Es un porcentaje. Es obligatorio para que una sesión sin avance no borre el avance actual ni los hitos (R-18, D-03).                                              |
| Horas y días de la meta enteros dentro de rango       | Esquema                                                                      | Metas medibles y comparables semana a semana (R-12).                                                                                                              |
| Hitos: máximo 5, objetivos enteros y sin repetir      | Esquema (rangos y máximo) y servicio (repetidos y orden)                     | Dos hitos con el mismo objetivo serían indistinguibles (R-16).                                                                                                    |
| Una sola meta activa por videojuego                   | Servicio (409) e índice único parcial `{ videojuego: 1 }` con `activa: true` | El servicio da un mensaje claro; el índice cubre la condición de carrera de dos peticiones simultáneas (E11000 → 409).                                            |
| Juego `completado` o `abandonado` sin meta activa     | Servicio                                                                     | No tiene sentido una meta semanal para un juego que ya no se juega (R-19); al pasar a esos estados, la meta activa se desactiva sola (R-20).                      |
| `plataforma`, `genero`, `estado` con valores cerrados | `enum`                                                                       | Evita variantes como «pc» o «PC » y hace fiables los filtros.                                                                                                     |
| Logros acotados a 50 y sin catálogos externos         | Servicio                                                                     | Es una lista corta que viaja con el juego; el usuario escribe sus propios logros.                                                                                 |
| Ids validados antes de consultar                      | Servicios y errorHandler                                                     | Un id mal formado responde 400 en lugar de un error interno.                                                                                                      |

---

## 4. Resumen calculado (fórmula)

`GET /api/videojuegos/:id/resumen` se calcula en la capa de servicio a partir de todas las partidas del videojuego:

| Campo                    | Fórmula                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `totalPartidas`          | Cantidad de partidas del videojuego                                                                           |
| `horasTotales`           | `suma(duracionMinutos) / 60`, redondeada a 1 decimal                                                          |
| `ultimaPartida`          | `fecha` más reciente (se usa `fecha`, no `createdAt`, porque se pueden registrar sesiones de días anteriores) |
| `porcentajeAvanceActual` | `porcentajeAvance` de la partida más reciente **que tenga avance**; 0 si ninguna lo tiene (R-18, D-03)        |

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
- **La partida más reciente no trae avance** (solo puede ser una partida antigua): se ignora y se toma el avance de la anterior que sí lo tenga.
- **Ninguna partida tiene avance:** `porcentajeAvanceActual` es 0.

**El avance es acumulado.** `porcentajeAvance` es el punto en el que quedaste **al terminar esa sesión**, no lo que avanzaste en ella (sesión 1 → 30 %, sesión 2 → 45 %). Por eso el resumen toma el de la última partida en lugar de sumarlos. Lo único que se suma es la duración.

**Decisión sobre el avance opcional (E2, D-03):** se combinan dos medidas.

- El avance es obligatorio en el formulario y también en la API.
- El resumen usa el avance de la partida más reciente que sí lo tenga.

Antes, una sola partida sin avance creada por la API ponía `porcentajeAvanceActual` en 0, y los hitos de la meta semanal dejaban de estar alcanzados. Lo obligatorio evita casos nuevos; lo segundo protege los datos antiguos (R-18).

---

## 5. Progreso semanal (E2)

`GET /api/videojuegos/:id/progreso-semanal` se calcula en cada consulta. El servicio carga las partidas y la meta activa y llama a funciones puras de `backend/src/dominio/`, que reciben «ahora» por parámetro y no leen el reloj. Todas las fechas se llevan a su **día en hora de Ecuador** (`America/Guayaquil`, con `Intl`).

| Campo               | Cómo se calcula                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `semana`            | De lunes a domingo, la que contiene a hoy (R-01)                                                                                                 |
| `horasSemana`       | Minutos de las partidas de la semana / 60, redondeado a 1 decimal. Una partida cuenta entera en el día en que empieza (R-02)                     |
| `porcentajeHoras`   | `min(100, round(horasSemana / horasSemanales × 100))`, sobre las horas ya redondeadas (R-08); `null` sin meta                                    |
| `diasJugadosSemana` | Días distintos con al menos una partida (R-03)                                                                                                   |
| `rachaActual`       | Días consecutivos con partida que terminan hoy o ayer: si hoy aún no juegas, la racha sigue viva (R-04, R-05)                                    |
| `mejorRacha`        | La racha más larga de todo el historial (R-06)                                                                                                   |
| `hitos`             | Ordenados por objetivo; `alcanzado` si `porcentajeAvanceActual ≥ porcentajeObjetivo` (R-17)                                                      |
| `metaCumplida`      | `true` si `porcentajeHoras` es 100 **y** `diasJugadosSemana ≥ diasPorSemana` (R-09); `null` sin meta. Es una extensión del formato del enunciado |

- La semana se evalúa con la meta activa **en el momento de la consulta**: cuentan las partidas anteriores a la creación de la meta (R-10).
- Las partidas de días posteriores a hoy que ya estuvieran guardadas se ignoran (R-23).

Ejemplo (8 partidas con una racha rota y una partida a las 23:30, consultado el domingo 15 de noviembre de 2026):

```json
{
  "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 4.5,
  "porcentajeHoras": 90,
  "diasJugadosSemana": 4,
  "rachaActual": 3,
  "mejorRacha": 4,
  "hitos": [
    {
      "descripcion": "Llegar al 25 %",
      "porcentajeObjetivo": 25,
      "alcanzado": true
    },
    {
      "descripcion": "Llegar al 50 %",
      "porcentajeObjetivo": 50,
      "alcanzado": true
    },
    {
      "descripcion": "Terminar el juego",
      "porcentajeObjetivo": 100,
      "alcanzado": false
    }
  ],
  "metaCumplida": false,
  "requestId": "<id>"
}
```

Sin meta activa: `meta: null`, `porcentajeHoras: null`, `hitos: []` y `metaCumplida: null`; horas, días y rachas se siguen calculando. El frontend muestra todo esto en la sección «Esta semana» del detalle del videojuego, y la vuelve a consultar al registrar o eliminar una partida y al cambiar una meta.

---

## 6. Política de eliminación

- **Eliminar un Videojuego** elimina también, en cascada y en este orden, todas sus **Partidas** y todas sus **Metas** (activas e inactivas), y después el videojuego (R-21). Sin transacción (D-06b, riesgo bajo).
- **Eliminar una Partida** borra únicamente esa sesión; el resumen y el progreso se recalculan en la siguiente consulta.
- **Las metas no se borran** (R-15): se desactivan y se pueden reactivar. No existe una ruta para borrar metas.
- **Pasar un videojuego a `completado` o `abandonado`** desactiva su meta activa (R-20). Volver a `jugando` no la reactiva sola; `pausado` no la toca.
- Un `DELETE` sobre un videojuego inexistente responde 404 sin tocar las demás colecciones.
- El frontend pide confirmación (`ModalConfirmacion`) antes de borrar un videojuego o una partida, o de desactivar una meta.
- **Alternativa descartada:** impedir el borrado de juegos con partidas (409). Es más segura, pero obliga al usuario a borrar sesión por sesión.

---

## 7. API

| Método      | Ruta                                    | Descripción                                                                                          |
| ----------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GET         | `/api/health`                           | Estado del servidor                                                                                  |
| GET         | `/api/videojuegos`                      | Lista; filtros opcionales `plataforma`, `genero`, `estado` (vacíos se ignoran; fuera del enum → 400) |
| GET         | `/api/videojuegos/:id`                  | Detalle                                                                                              |
| POST        | `/api/videojuegos`                      | Crear                                                                                                |
| PUT / PATCH | `/api/videojuegos/:id`                  | Actualizar (a `completado` o `abandonado` desactiva su meta activa)                                  |
| DELETE      | `/api/videojuegos/:id`                  | Eliminar (con cascada a partidas y metas)                                                            |
| POST        | `/api/videojuegos/:id/logros`           | Agregar logro                                                                                        |
| PATCH       | `/api/videojuegos/:id/logros/:logroId`  | Actualizar nombre y/o `obtenido`                                                                     |
| DELETE      | `/api/videojuegos/:id/logros/:logroId`  | Eliminar logro                                                                                       |
| GET         | `/api/videojuegos/:id/partidas`         | Partidas de un videojuego                                                                            |
| GET         | `/api/videojuegos/:id/resumen`          | **Resumen calculado**                                                                                |
| GET         | `/api/partidas`                         | Lista con `populate("videojuego")`                                                                   |
| POST        | `/api/partidas`                         | Crear (verifica el videojuego, la fecha, la duración y el avance)                                    |
| DELETE      | `/api/partidas/:id`                     | Eliminar una partida                                                                                 |
| **E2**      |                                         |                                                                                                      |
| GET         | `/api/videojuegos/:id/progreso-semanal` | **Progreso semanal calculado** (sección 5)                                                           |
| GET         | `/api/videojuegos/:id/metas`            | Metas del videojuego, activa e inactivas (la activa primero): `{ total, metas, requestId }`          |
| POST        | `/api/metas`                            | Crear una meta (`videojuego` en el cuerpo): 201 `{ meta, requestId }`                                |
| GET         | `/api/metas/:id`                        | Detalle de una meta                                                                                  |
| PATCH       | `/api/metas/:id`                        | Editar horas, días e hitos de la meta **activa** (`videojuego` y `activa` no se pueden modificar)    |
| PATCH       | `/api/metas/:id/desactivar`             | Desactivar la meta activa                                                                            |
| PATCH       | `/api/metas/:id/reactivar`              | Reactivar una meta inactiva                                                                          |

**Formato de respuestas:** las exitosas con cuerpo incluyen `_id` y `requestId`; los listados incluyen `total`; la eliminación de recursos principales responde sin cuerpo (204) y la de un logro devuelve el videojuego actualizado.

**Operaciones sobre logros embebidos:** el servicio carga el Videojuego, modifica el subdocumento y guarda el documento padre con `save()` para que se ejecuten las validaciones del esquema.

### Manejo de errores

| Tipo                             | Cómo se reconoce                                                                                  | HTTP | Cuerpo                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ---: | -------------------------------------------------------- |
| Validación                       | `ValidationError`, validación de entrada en el controlador o regla del servicio; JSON mal formado |  400 | `{ "error", "requestId" }`                               |
| Id mal formado                   | `CastError` o validación previa                                                                   |  400 | `{ "error", "requestId" }`                               |
| Recurso o referencia inexistente | `ApiError` con estado 404                                                                         |  404 | `{ "error", "requestId" }`                               |
| Conflicto con el estado actual   | `ApiError` con estado 409, o error de clave duplicada de MongoDB (E11000)                         |  409 | `{ "error", "requestId" }`                               |
| Error inesperado                 | Cualquier otro; se registra en el servidor sin exponer detalles                                   |  500 | `{ "error": "Error interno del servidor", "requestId" }` |

**Casos de 409 (E2):**

- «Este videojuego ya tiene una meta activa» (crear).
- «Este videojuego ya tiene otra meta activa» (reactivar).
- «El videojuego está completado: no puede tener una meta activa» (o abandonado; al crear o reactivar).
- «Solo se puede editar la meta activa».
- «La meta ya está inactiva» y «La meta ya está activa».
- Si dos peticiones simultáneas crean la meta activa del mismo juego, el índice único rechaza la segunda (E11000) y el servicio responde el mismo 409 «Este videojuego ya tiene una meta activa» (comprobado: 201 y 409, nunca 500). Cualquier otro E11000 llega al `errorHandler` como 409 genérico «Ya existe un registro con esos datos».

Los mensajes de validación del esquema todavía salen con el prefijo técnico de Mongoose («Meta validation failed: …»); está registrado como deuda diferida (D-05 parcial).

---

## 8. Cambios y mejoras respecto a la arquitectura de referencia

El proyecto replica la estructura, el orden de capas y el manejo de errores del proyecto de referencia (documentados en `docs/ARQUITECTURA.md` y `docs/ARQUITECTURA-FRONTEND.md`). Estas son las diferencias deliberadas:

### Backend

| Referencia                                     | Este proyecto                                                                                | Motivo                                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Orden: CORS → JSON → `requestId` → logger      | `requestId` → logger → CORS → JSON                                                           | Un error de JSON mal formado ahora también lleva `requestId` y queda registrado.                 |
| Un JSON mal formado caía como error inesperado | Responde **400**                                                                             | Es un error del cliente, no del servidor.                                                        |
| Sin `CORS_ORIGIN`                              | Variable nueva: obligatoria en producción, `http://localhost:5173` por defecto en desarrollo | CORS correcto entre dos servicios desplegados, sin dejar localhost en producción por descuido.   |
| Sin patrón para subdocumentos embebidos        | Operaciones de logros en el servicio: cargar padre, modificar y `save()`                     | Mantiene las validaciones del esquema y el límite de 50.                                         |
| Referencia sin entidad hija que limpiar        | Cascada de Partidas y Metas al eliminar un Videojuego                                        | Evita partidas y metas huérfanas.                                                                |
| Sin endpoint calculado                         | Resumen y progreso semanal en el servicio                                                    | Lógica de negocio centralizada.                                                                  |
| Sin capa de dominio ni tests                   | `src/dominio/` con funciones puras y tests de Vitest junto a cada archivo (`*.test.ts`)      | Las reglas de semana, racha e hitos se prueban sin base de datos, con «ahora» fijado en el test. |
| Sin 409                                        | `errorHandler` traduce el E11000 a 409                                                       | La regla «una meta activa» también se respeta ante peticiones simultáneas.                       |

### Frontend

| Referencia                                       | Este proyecto                                                                                    | Motivo                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Lógica `fetch` duplicada en cada módulo de API   | Cliente HTTP común en `api/` con tipo de error propio                                            | Una sola implementación para 204, errores `{ error, requestId }` y fallos de red. |
| `VITE_API_URL` opcional (cadena vacía)           | Obligatoria: la app falla con mensaje claro si falta                                             | Evita despliegues apuntando a un origen equivocado sin avisar.                    |
| Sin página 404                                   | Ruta comodín con página propia                                                                   | Direcciones inexistentes muestran una vista de error diseñada.                    |
| Selector de entidad referenciada solo en el alta | `SelectorVideojuego` reutilizable que envía el `_id`                                             | El usuario nunca escribe un ObjectId; llega prellenado desde el detalle.          |
| Sin edición de subdocumentos                     | Agregar, marcar y quitar logros desde el detalle                                                 | Cubre la operación sobre el subdocumento embebido.                                |
| Sin validación de rangos en cliente              | Validación espejo del backend (duración de 5 a 1440, avance 0–100, máx. 50 logros, máx. 5 hitos) | Mejor experiencia; los errores del servidor se muestran igualmente.               |
| Fechas en la zona del navegador                  | Fechas en hora de Ecuador (`utils/formatoFecha.ts`); el formulario envía `-05:00`                | El día de una partida no depende de dónde esté la persona (D-02).                 |

---

## 9. Incidencias y soluciones

| Incidencia                                           | Solución                                                                                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ApiError` sin exportación por defecto               | Se corrigieron los imports para usar la exportación nombrada.                                                                                                                       |
| Listado vacío sin filtros                            | Se enviaban propiedades `undefined` a la consulta de Mongoose. El servicio ahora construye el filtro solo con valores definidos y no vacíos, y valida los filtros contra sus enums. |
| JSON mal formado con `curl.exe` en PowerShell        | El escape de comillas inline producía peticiones inválidas. Se escribe el JSON en un archivo UTF-8 sin BOM y se envía con `--data-binary @archivo`.                                 |
| Rutas nuevas no visibles en un servidor ya ejecutado | Hay que reiniciar el backend para cargar la versión compilada.                                                                                                                      |
| Avance actual en 0 por una partida sin avance (D-03) | Avance obligatorio en la API y resumen con la última partida que tenga avance (T-19).                                                                                               |
| Partidas sin hora caían en el día anterior (D-02)    | La API exige hora y zona y el formulario envía `-05:00` (T-20); el día se calcula en hora de Ecuador.                                                                               |

---

## 10. Cómo ejecutar

Requisitos: **Node.js 20 o superior** (lo fija `engines` en cada `package.json`) y una base de MongoDB Atlas.

| Paso       | Backend (`backend/`)                                                                         | Frontend (`frontend/`)       |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| Variables  | `MONGODB_URI` (obligatoria), `MONGODB_DB`, `PORT`, `CORS_ORIGIN` (obligatoria en producción) | `VITE_API_URL` (obligatoria) |
| Ejemplo    | `backend/.env.example`, sin credenciales                                                     | `frontend/.env.example`      |
| Instalar   | `npm install`                                                                                | `npm install`                |
| Desarrollo | `npm run dev`                                                                                | `npm run dev`                |
| Tests      | `npm test` (Vitest)                                                                          | —                            |
| Build      | `npm run build` y `npm start`                                                                | `npm run build`              |

Formato: `npm run format -- <archivos>` en la raíz (Prettier).

---

## 11. Cómo trabajamos con el agente

La épica E2 se construyó con **Claude Code** siguiendo **Spec-Driven Development**: ninguna línea de código sin una spec commiteada antes, y cada decisión de negocio la toma la estudiante (el agente propone opciones).

### Harness

| Pieza                     | Qué hace                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md` y `CLAUDE.md` | Reglas del proyecto para el agente (`CLAUDE.md` solo importa `AGENTS.md`): stack, estructura, comandos, convención de capas, dominio puro con «ahora» inyectado, formato de commits y que no se lee ningún archivo de entorno |
| `DESIGN.md`               | Sistema de diseño: tokens de `tema.css`, componentes de `ui/`, tono, accesibilidad, uso permitido de Bootstrap y «No hacemos»                                                                                                 |
| Skill `/nueva-spec`       | Crea una spec desde la plantilla (DEBE / NO DEBE, contrato, criterio → verificación, ticket → archivos). Solo la invoca la estudiante                                                                                         |
| Skill `/commit`           | Revisa el diff, comprueba que no entre ningún archivo de entorno y propone el mensaje; hace el commit solo tras la confirmación                                                                                               |
| Hook `proteger-env.mjs`   | `PreToolUse`: bloquea cualquier lectura, edición, búsqueda o comando que mencione un archivo de entorno (salvo `.env.example`)                                                                                                |
| Hook `formatear.mjs`      | `PostToolUse`: pasa Prettier por el archivo recién editado                                                                                                                                                                    |

### Flujo seguido

`diagnóstico → harness → PRD → backlog (historias, criterios, tickets) → specs → código con tests → deuda técnica → auditoría`

1. **Diagnóstico** del Proyecto 3 (D-01 a D-14), con una decisión por problema.
2. **PRD** con las reglas R-01 a R-23, decididas por la estudiante a partir de los huecos de la ficha.
3. **Backlog**: 13 historias, 63 criterios con fechas concretas y 21 tickets.
4. **Dos specs** (backend y frontend), commiteadas antes que su código.
5. **Implementación** ticket a ticket, un commit por ticket. Los tests se escriben primero y se ven fallar en su aserción; en los tickets de API, el curl se ejecuta antes del código.
6. **Deuda pagada**: D-03 (T-19) y D-10 con D-02 (T-20).
7. **Auditoría**: una fila por criterio de cada spec, con su evidencia.

**Lo que aprendimos** ([`docs/bitacora-agente.md`](docs/bitacora-agente.md)):

- En la fase 6, el agente dio por buenos tests que solo habían fallado por un import inexistente y escribió algunas pruebas de API después del código. La estudiante lo detectó al cerrar la fase y fijó la regla «rojo en la aserción y curl antes del código».
- En la fase 8, el agente se equivocó en un script de edición: `$$this` se convirtió en `$this`, y el resumen habría devuelto siempre 0. Lo detectó al revisar el diff, antes de ejecutar nada.

### Dónde encontrar cada documento

El mapa completo, con qué produce y qué consume cada fase, está en [`docs/PLAN-E2.md`](docs/PLAN-E2.md).

| Pregunta                                         | Documento                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| ¿Qué se pide y cómo se trabajó?                  | `docs/contexto/`, `docs/PLAN-E2.md`                                                   |
| ¿En qué estado estaba el proyecto y qué se pagó? | `docs/diagnostico.md`                                                                 |
| ¿Qué producto y con qué reglas?                  | `docs/prd/PRD.md` (R-XX), `docs/backlog/epicas.md`                                    |
| ¿Qué historias, criterios y tickets?             | `docs/backlog/E2-metas-y-rachas.md` (HU-XX, CA-XX.Y, T-XX)                            |
| ¿Cómo se construye?                              | `docs/specs/E2-backend-metas-progreso.md`, `docs/specs/E2-frontend-metas-progreso.md` |
| ¿Se cumplió cada criterio?                       | `docs/AUDITORIA.md`, con la evidencia en `docs/pruebas-api-E2.md` y `docs/evidencia/` |
| ¿Cómo se trabajó con el agente?                  | `AGENTS.md`, `DESIGN.md`, `.claude/` y `docs/bitacora-agente.md`                      |

---

## 12. Demo

_Pendiente._

Flujo previsto:

1. Crear un videojuego y fijar una meta semanal con hitos.
2. Registrar partidas y ver cómo se actualizan las barras, la racha y los hitos.
3. Desactivar y reactivar la meta.
4. Recorrer la trazabilidad de CA-05.2 de punta a punta (`docs/AUDITORIA.md` §5).
