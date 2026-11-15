# Diagnóstico del Proyecto 3: Diario de Progreso Gamer

## 1. Estado del Proyecto 3

### 1.1 Qué funciona

- **API REST completa para E1** (`backend/src/routes/*.ts`):
  - Videojuegos: CRUD, con filtros por `plataforma`, `genero` y `estado` validados contra sus enums.
  - Logros embebidos: agregar, actualizar y eliminar, usando `save()` para que corran las validaciones del esquema.
  - Partidas: listar, crear (comprueba que el videojuego exista) y eliminar.
  - `GET /api/videojuegos/:id/resumen`, calculado con un *aggregate* (`backend/src/services/videojuego.service.ts:112-162`).
  - `GET /api/health`.
- **Manejo de errores centralizado** (`backend/src/middlewares/errorHandler.ts`): JSON mal formado, `ValidationError` y `CastError` responden 400; un `ApiError` responde con su propio estado; cualquier otro error responde 500 sin dar detalles. Todas las respuestas llevan `requestId`, que también va en la cabecera `X-Request-Id`.
- **Cascada** Videojuego → Partidas al eliminar (`videojuego.service.ts:93-103`).
- **Frontend**:
  - Listado con filtros, detalle con resumen y logros, formularios de videojuego y partida, listado global de partidas con confirmación de borrado, y página 404.
  - Cliente HTTP común (`frontend/src/api/httpClient.ts`), con servicios separados por recurso.
  - Sistema de estilos propio: tokens en `frontend/src/estilos/tema.css` y componentes en `frontend/src/components/ui/`.
- **Compilación:** `tsc --noEmit` pasa sin errores en backend y frontend (comprobado el 2026-11-15).
- **Despliegue:** las dos URLs de Render responden 200 (comprobado el 2026-11-15): `https://progresogamer-api-emilse.onrender.com/api/health` y `https://progresogamer-app-emilse.onrender.com`.

### 1.2 Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Express 4, TypeScript 5 (CommonJS), Mongoose 8, dotenv, cors. Se ejecuta con `tsx watch` en desarrollo y `tsc` + `node dist` en producción |
| Base de datos | MongoDB Atlas |
| Frontend | React 18, Vite 6, TypeScript 5.8, React Router 6, Bootstrap 5.3 (importado en `main.tsx:4`) más CSS propio con variables |
| Despliegue | Render: Web Service (backend) y Static Site (frontend) |
| Pruebas / lint / formato | **Ninguno** (ver D-01 y D-10) |

### 1.3 Estructura

```text
backend/src/   config/ · controllers/ · errors/ · middlewares/ · modelos/ · routes/ · services/ · app.ts · server.ts
frontend/src/  api/ · components/ (ui/, iconos/) · estilos/ · paginas/ · App.tsx · main.tsx · types.ts · enums.ts
docs/          ARQUITECTURA.md · ARQUITECTURA-FRONTEND.md · contexto/ · prd/ (vacía) · backlog/ (vacía) · specs/ (vacía)
```

No hay capa de dominio (`src/dominio/`). Tampoco existen todavía `AGENTS.md`, `CLAUDE.md`, `.claude/` ni `DESIGN.md`; corresponden a la fase 2.

### 1.4 Despliegue y estado de Git

- El README (`README.md:5-11` y `263-281`) documenta los dos servicios, sus comandos de build y start, las variables de entorno y la regla de *rewrite*. No hay `render.yaml`: la configuración vive solo en el panel de Render.
- `package.json` no declara `engines`. El README pide Node 18 (`README.md:206`) y el enunciado pide Node 20 o superior.
- **Git:**
  - El `main` local está *ahead 2, behind 7* respecto de `origin/main`.
  - `origin/main` ya integró el PR #1 de estilos (`a64cd31`).
  - En local, esos mismos cambios de frontend se commitearon otra vez dentro de `6f6d333`, junto con los documentos de contexto.
  - La rama `feature/e2-metas-rachas` ya existe, pero parte de `18d90d7`: no tiene ni los estilos ni `docs/contexto/`.
- No se puede comprobar desde el repositorio qué commit está desplegado en Render.

## 2. Tabla de problemas

Clasificación **propuesta**; la decisión final es de la estudiante.

| ID | Problema | Evidencia | Impacto en E2 | Propuesta |
|---|---|---|---|---|
| D-01 | No hay pruebas automáticas ni test runner. Tampoco hay script `test`, Vitest ni archivos `*.test.ts` en ningún paquete | `backend/package.json:5-9`, `frontend/package.json:6-10`; ninguna búsqueda de `*.test.ts` / `vitest.config.*` da resultados | El enunciado exige tests de las funciones de dominio (7.3), ejecutarlos antes de cerrar cada tarea (regla de `AGENTS.md`) y un test por cada deuda pagada (7.5) | **Bloquea** |
| D-02 | `fecha` guarda un **instante** (fecha y hora en UTC), no un día del calendario. El frontend envía fecha y hora (`datetime-local`) convertidas a ISO con la zona del navegador. La API también acepta `"2026-11-10"` sin hora, que se interpreta como `00:00Z` y en Guayaquil (UTC−5) cae en el **día anterior**, a las 19:00. La interfaz muestra las fechas en la zona del navegador, no en la de Ecuador | `Partida.model.ts:28-31`; `partida.controller.ts:42-44, 70`; `PartidaForm.tsx:76, 100-108`; `ListaPartidasPage.tsx:168-175` y `DetalleVideojuegoPage.tsx:29-43` (sin `timeZone`); ejemplo `"2026-10-02T00:00:00.000Z"` en `README.md:114` | Para contar días jugados, la semana (lunes a domingo) y las rachas hay que llevar cada instante a su día en America/Guayaquil. Si no, las partidas de las 19:00 a las 23:59 en Ecuador, o las creadas con una fecha sin hora, caen en el día equivocado. Está ligado a los huecos 1, 2 y 3. Una partida que cruza la medianoche solo guarda su inicio (`fecha`) y su `duracionMinutos` | **Bloquea** |
| D-03 | Si la partida más reciente no trae `porcentajeAvance`, el resumen devuelve `porcentajeAvanceActual = 0` aunque haya avances anteriores. La API acepta partidas sin avance, aunque el formulario del frontend lo exige. La decisión sobre el avance opcional quedó sin completar en el README | `videojuego.service.ts:127, 134-136`; `Partida.model.ts:37-41`; `partida.controller.ts:54-62`; `PartidaForm.tsx:60-63`; `README.md:124, 128` (texto por completar) | Un hito se considera alcanzado cuando `porcentajeAvanceActual` es mayor o igual que su objetivo. Una partida sin avance, creada por la API o con curl, hace que **todos los hitos dejen de estar alcanzados** de golpe. Está ligado al hueco 6 | **Bloquea** |
| D-04 | No se puede editar una Partida: no hay ruta PUT/PATCH, ni función de servicio, ni pantalla | `partida.routes.ts:10-12`; `partida.service.ts` (solo `crear`, `eliminar` y `listar`); `partidasApi.ts:10-27`; `App.tsx:19-24` | El enunciado (sección 6) dice que el progreso se vuelve a consultar «al registrar, editar o eliminar una partida». Sin edición, corregir una fecha o un avance mal registrados obliga a borrar la partida y crearla de nuevo | **Se difiere** (buena candidata a deuda pagada) |
| D-05 | El errorHandler no reconoce el error de clave duplicada de Mongo (`E11000`, `MongoServerError` con código `11000`): cae en el caso genérico y responde **500**. Hoy no existe ningún 409, aunque un `ApiError(…, 409)` ya pasaría tal cual. La tabla de errores del README no incluye 409. Los mensajes de `ValidationError` se devuelven en bruto (`"Partida validation failed: …"`) | `errorHandler.ts:39-58`; `README.md:167-172` | E2 exige **409** cuando ya hay una meta activa para el videojuego y que el errorHandler distinga 400, 404, 409 y 500. Si la unicidad se garantiza con un índice, la condición de carrera llegaría como `E11000` y respondería 500 | **Bloquea** |
| D-06 | La cascada borra las Partidas y luego el Videojuego, sin transacción. No incluye metas porque todavía no existen | `videojuego.service.ts:93-103`; `README.md:132-138` | Hay que extenderla a `Meta` (todas, activas e inactivas, con sus hitos embebidos), según la decisión del hueco 8. Sin transacción, un fallo a mitad del proceso deja datos huérfanos parciales | **Bloquea** (la extensión a Meta). La falta de transacción **se difiere** |
| D-07 | Las validaciones de entrada están repartidas en tres capas: los **controladores** validan la forma del cuerpo (`parsePartidaInput` y `parseVideojuegoInput`); los **servicios** validan ids, filtros y existencia (`assertValidId` está duplicado en los dos servicios); los **esquemas** validan los rangos. Además son inconsistentes: Partida rechaza campos desconocidos y Videojuego no | `partida.controller.ts:18-77`; `videojuego.controller.ts:45-111, 123-166`; `partida.service.ts:6-10`; `videojuego.service.ts:21-35` | Hay que fijar una convención para Meta: dónde va la forma del cuerpo, los rangos, «el videojuego existe» y la regla de una sola meta activa. Sin esa convención, el agente puede duplicar las reglas o dejarlas fuera del servicio | **Se difiere** (no es un defecto; se fija como convención en `AGENTS.md` y en la spec) |
| D-08 | Uso de `runValidators`: `actualizarVideojuego` sí lo usa, los logros usan `save()` y Partida no tiene actualización. Hoy no es un defecto, pero las actualizaciones de Meta (`findByIdAndUpdate` sobre `horasSemanales`, `diasPorSemana` e `hitos`) se saltarían los `min`, `max` y el máximo de 5 hitos si se omite | `videojuego.service.ts:80-84, 180, 209, 228` | Es un riesgo de saltarse las reglas de Meta en el PATCH o PUT | **Se difiere** (se fija como regla DEBE en la spec) |
| D-09 | Un Videojuego `completado` o `abandonado` no tiene ninguna restricción. El modelo tiene `estado`, pero ninguna regla de negocio lo usa | `Videojuego.model.ts:20-25, 82-85` | Ligado al hueco 7 (¿puede tener meta activa?) | **Bloquea** solo si el hueco 7 se decide como «no» |
| D-10 | Se aceptan partidas con fecha **futura** y `duracionMinutos` no tiene máximo (podría ser una sesión de varios días) | `partida.controller.ts:42-52`; `Partida.model.ts:32-36` | Una fecha futura inflaría la racha y la semana, y una duración enorme distorsiona `horasSemana`. Es un hueco adicional a documentar en el PRD | **Se difiere** (documentar como supuesto) |
| D-11 | Partida no tiene índice sobre `{ videojuego, fecha }` | `Partida.model.ts:21-47` | La racha se calcula sobre **todo el historial**, así que la consulta por videojuego ordenada por fecha recorre la colección completa. Con el volumen esperado no es crítico | **Se difiere** |
| D-12 | Detalles del README: la tabla de URLs tiene un separador de 3 columnas para 2 columnas; la tabla de justificación no tiene fila de cabecera; falta la sección «Cómo trabajamos con el agente» (exigida en el checklist); el README habla de Node 18 | `README.md:7-8, 79-81, 128, 206` | Es un entregable final, pero no bloquea la implementación | **Se difiere** (se corrige en la fase 9) |
| D-13 | Bootstrap 5 se carga de forma global junto con el sistema de tokens propio | `frontend/package.json:12`; `main.tsx:4-6` | El enunciado (7.4) dice «sin librerías de UI que `DESIGN.md` no autorice», así que `DESIGN.md` debe autorizar Bootstrap explícitamente o limitar su uso | **Se difiere** (se decide al redactar `DESIGN.md` en la fase 2) |
| D-14 | En el detalle no se pueden borrar ni editar partidas: el resumen se vuelve a consultar solo al montar la página o con «reintentar». Crear una partida lleva a otra página | `DetalleVideojuegoPage.tsx:125-156`; `App.tsx:20-24` | El progreso semanal debe volver a consultarse tras registrar, editar o eliminar una partida. Hoy eso ocurre por el remontaje y no de forma explícita | **Se difiere** (se cubre en la spec del frontend) |

**Restos de pantallas temporales:** no se encontraron. No hay rutas de prueba en `App.tsx`, ni `TODO` o `FIXME`, ni `console.log` en `frontend/src`. Las carpetas `dist/` existen en local, pero están en `.gitignore`. El único resto es el archivo vacío `docs/contexto/EnunciadoE4.md` (D-07).

## 3. Decisiones tomadas

| ID | Decisión | Motivo |
|---|---|---|
| D-01 | **Bloquea.** Se resuelve en T-01 (Vitest) | Sin runner no hay tests de dominio ni regla de “tests antes de terminar”|
| D-02 | **Bloquea.** El día se calcula en el dominio con Intl y America/Guayaquil; la interfaz muestra fechas en esa zona. Rechazar fechas sin hora se decide en la spec | Las rachas y la semana dependen del día correcto |
| D-03 | **Bloquea y se paga como deuda (fase 8).** porcentajeAvance pasa a ser obligatorio también en la API | Es la causa de que los hitos “desaparezcan”. Requiere criterio, test y actualizar la fórmula del README |
| D-04 | **Se difiere.**  | Es grande (backend y frontend) y no bloquea la épica. Se documenta que “editar” queda cubierto por borrar y recrear |
| D-05 | **Bloquea.** Se resuelve en T-08: E11000 → 409 | SE2 exige 409 y la condición de carrera llegaría como 500 |
| D-06a | **Bloquea.** Extender la cascada a Meta (activas e inactivas) | Es la decisión del hueco 8 |
| D-06b | **Se difiere.** Extender la cascada a Meta (activas e inactivas) | Sin transacción hay un riesgo pequeño; las transacciones exigen réplica y complican el despliegue |
| D-07 | **Se difiere** como refactor; se fija la convención en AGENTS.md y la spec | Reescribir las capas existentes no aporta a E2 |
| D-08 | **Se difiere,** pero runValidators: true es regla DEBE en la spec de Meta | Evita saltarse los rangos y el máximo de 5 hitos |
| D-09 | **Pendiente de la fase 3 (hueco 7)** | Si la decisión es “no puede tener meta”, entra en E2 |
| D-10 | **Se paga como deuda (fase 8):** crechazar fechas futuras y fijar una duración máxima | Pequeño, testeable y protege la racha y horasSemana |
| D-11 | **Se difiere** | Con el volumen esperado no afecta el rendimiento |
| D-12 | **Se difiere** a la fase 9 | Es documentación final |
| D-13 | **Se difiere** se decide en DESIGN.md (autorizar Bootstrap con límites) | Es una decisión de diseño de la fase 2 |
| D-14 | **Se difiere** se cubre en la spec del frontend (T-12) | El refresco explícito es parte de la épica |