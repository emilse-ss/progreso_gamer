# Plan de trabajo y mapa de documentación · Épica E2 «Metas y rachas»

> Este documento explica **cómo** se trabaja la épica E2 y cómo se relacionan los documentos del repositorio. Lo que se pide entregar está en `contexto/enunciado-e4.md`; aquí no se repite. Es la base de la sección «Cómo trabajamos con el agente» del README.

## 1. Cadena de trabajo (Spec-Driven Development)

```
diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs → código con tests → auditoría
```

Cada eslabón se escribe **antes** que el siguiente y se commitea por separado. El código se implementa solo a partir de una spec; si falta una decisión, se vuelve al documento anterior, no se improvisa.

## 2. Mapa de documentos

| Documento | Responde | Lo produce | Lo consume |
|---|---|---|---|
| `contexto/enunciado-e4.md` | Qué se pide y cómo se evalúa | Entregado | Todas las fases |
| `contexto/ficha-cliente.md` | Qué quiere el cliente (fuente del producto) | Entregado | PRD |
| `diagnostico.md` | En qué estado está el Proyecto 3 y qué se arregla o difiere | Fase 1 | Harness, PRD, deuda técnica |
| `/AGENTS.md`, `/CLAUDE.md` | Cómo debe trabajar el agente (reglas, comandos, estructura) | Fase 2 | Cada sesión del agente |
| `/DESIGN.md` | Identidad visual y límites de diseño | Fase 2 | Specs y código del frontend |
| `prd/PRD.md` | Qué producto se construye y con qué reglas de negocio, **sin detalle técnico** | Fase 3 | Backlog |
| `backlog/epicas.md` | Qué cubre cada épica (E1 y E2) | Fase 3 | Backlog |
| `backlog/E2-metas-y-rachas.md` | Historias, criterios y tickets | Fase 4 | Specs, código, auditoría |
| `specs/*.md` | Cómo se construye: contrato, reglas DEBE / NO DEBE, criterio → verificación, ticket → archivos | Fase 5 | Código y tests |
| `AUDITORIA.md` | Si cada criterio se cumplió y con qué evidencia | Fase 9 | Entrega y demo |
| `bitacora-agente.md` | Qué se le pidió al agente y cómo se corrigió | Durante todo el trabajo | Entrega |

## 3. Convenciones de identificadores

Los IDs son **estables**: nunca se renumeran ni se reutilizan. Son lo que permite recorrer un criterio de punta a punta.

| Prefijo | Significa | Ejemplo | Vive en |
|---|---|---|---|
| `D-XX` | Problema del diagnóstico | `D-03` | `diagnostico.md` |
| `R-XX` | Regla de negocio | `R-05` | PRD |
| `HU-XX` | Historia de usuario | `HU-02` | Backlog |
| `CA-XX.Y` | Criterio de aceptación de la historia XX | `CA-02.1` | Backlog |
| `T-XX` | Ticket | `T-03` | Backlog y specs |

**Los IDs del diagnóstico no son consecutivos:** D-07, D-08 y D-10 se gestionan fuera de ese documento (ver sección 6). No se renumera para no romper referencias.

**Trazabilidad de ejemplo:** `R-02` (PRD) → `HU-03` y `CA-03.2` (backlog) → `T-03` (ticket) → fila en la spec (criterio → verificación) → test con el `CA` en su nombre → commit `feat(E2): T-03 ...` → fila en `AUDITORIA.md`.

## 4. Fases

| # | Fase | Entrada (lee) | Salida (produce) | Modo | Commit | Criterio de salida |
|---|---|---|---|---|---|---|
| 0 | Preparación | Enunciado y ficha | Rama `feature/e2-metas-rachas`, `docs/contexto/` | Manual | `docs: contexto de la actividad E2` | Rama parte de `origin/main` actualizado, sin duplicar commits |
| 1 | Diagnóstico | Enunciado, ficha, repositorio | `diagnostico.md` con sus decisiones | Plan mode | `docs(diagnostico): ...` | Cada problema tiene decisión y motivo; se eligen ≥ 2 para pagar |
| 2 | Harness | Diagnóstico, `tema.css` | `AGENTS.md` (≤ 60 líneas), `CLAUDE.md`, skill, hook, `DESIGN.md` | Normal | `chore(harness): ...` | `/hooks` muestra el hook; el hook de `.env` bloquea; captura guardada |
| 3 | PRD y épicas | Ficha, diagnóstico | `prd/PRD.md`, `epicas.md` | Plan mode, luego normal | `docs(prd): ...` | Los 8 huecos tienen decisión o punto abierto justificado; sin detalle técnico |
| 4 | Backlog | PRD, épicas | `E2-metas-y-rachas.md` | Normal | `docs(backlog): ...` | Cada regla `R-XX` llega a un criterio; todo criterio tiene ejemplo con fechas |
| 5 | Specs | Backlog, `DESIGN.md` | Spec de backend y spec de frontend | Normal | `docs(spec): ...` (una por spec) | Cada criterio tiene verificación; cada ticket tiene archivos |
| 6 | Backend | Spec de backend, tickets | Tests, dominio, modelo, servicios, rutas | Plan mode, luego normal | `feat(E2): T-XX ...` | Tests pasando; tabla de pruebas con curl (sin partidas, ≥ 5 partidas con racha rota, 400, 404, 409) |
| 7 | Frontend | Spec de frontend, `DESIGN.md` | Sección de progreso, `MetaForm`, `metasApi.ts` | Normal | `feat(E2): T-XX ...` | `npm run build` sin errores; tabla de revisión de diseño sin desviaciones |
| 8 | Deuda técnica | Diagnóstico, backlog | ≥ 2 problemas pagados | Normal | `fix(deuda): D-XX ...` | Cada uno con criterio, test, código y verificación |
| 9 | Auditoría, despliegue y PR | Specs, backlog | `AUDITORIA.md`, README final, Render, PR | Normal | `docs(auditoria): ...` | Una fila por criterio; PR con tickets listados; URLs públicas funcionando |
| 10 | Demo | Todo lo anterior | Video o sesión en vivo (≤ 6 min) | Manual | — | Cubre el flujo del enunciado, sección 9 |

**Regla de oro del orden en Git:** la spec se commitea antes que el código que implementa. Se comprueba con `git log --oneline --reverse`.

## 5. Arquitectura objetivo (propuesta, se fija en la spec)

> Lo siguiente es una **propuesta de trabajo**, no un requisito del cliente. Solo vale lo que quede escrito en las specs.

```text
backend/src/
├── dominio/         Funciones puras (semana, días, racha, hitos); reciben "ahora" por parámetro
├── modelos/         + Meta
├── services/        + meta.service (CRUD, 409, referencia), + progreso.service (consulta y llama al dominio)
├── controllers/     + meta.controller
├── routes/          + meta.routes
└── middlewares/     errorHandler + 409 (incluye el error de clave duplicada de Mongo)
```

- El dominio no importa Mongoose ni Express y no llama a `Date.now()`.
- Zona horaria con `Intl.DateTimeFormat` y `America/Guayaquil`, sin dependencias nuevas.
- Una sola meta activa por videojuego, con doble defensa: validación en el servicio (409 claro) e índice único parcial.
- El estado «alcanzado» de un hito no se guarda: se calcula con el resumen existente.
- Frontend: `metasApi.ts` separado, sección de progreso en el detalle, `MetaForm` reutilizable para crear y editar, y refresco del progreso al cambiar las partidas.

## 6. Tareas fuera del diagnóstico

Estos puntos se detectaron en el diagnóstico, pero se gestionan aquí para no mezclar el documento de estado con el de acciones. **Siguen siendo necesarios.**

| Tarea | Por qué importa | Cuándo |
|---|---|---|
| Base de Git limpia: la rama parte de `origin/main` y no duplica los estilos | Evita conflictos en el PR y ensuciar la trazabilidad | Fase 0 |
| Corregir `backend/.env.example` (formato, `CORS_ORIGIN`, `NODE_ENV`) y dar un ejemplo en el del frontend | Es un entregable explícito del enunciado | Fase 2 |
| Instalar y configurar Prettier, y declarar `engines` (Node 20+) | El hook de formato lo necesita; el enunciado pide Node 20 o superior | Fase 2 |

## 7. Reglas de trabajo con el agente

1. **Una fase por sesión.** `/clear` entre fases: los documentos son la memoria, no la conversación.
2. **Plan mode** cuando el enunciado lo pide, y se revisa el plan antes de aprobarlo.
3. **Las decisiones de negocio son de la estudiante.** El agente propone opciones; no decide.
4. **Un ticket por turno** en las fases 6 y 7, con los tests primero (rojos) y el código después.
5. **Revisar `git diff` antes de cada commit** y comprobar que no entra ningún `.env`.
6. **Cambio de regla:** se actualiza en este orden: PRD → criterio → spec → código.
7. **La bitácora se escribe cuando ocurre el momento**, no al final. Se necesitan de 5 a 8, y uno debe ser una desviación de la spec detectada.

## 8. Estado

| Fase | Estado |
|---|---|
| 0. Preparación | ☐ |
| 1. Diagnóstico | ☐ En curso (falta completar decisiones) |
| 2. Harness | ☐ |
| 3. PRD y épicas | ☐ |
| 4. Backlog | ☐ |
| 5. Specs | ☐ |
| 6. Backend | ☐ |
| 7. Frontend | ☐ |
| 8. Deuda técnica | ☐ |
| 9. Auditoría, despliegue y PR | ☐ |
| 10. Demo | ☐ |

_Se actualiza al cerrar cada fase, dentro del mismo commit._