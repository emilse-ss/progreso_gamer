# Enunciado E4: Diario de Progreso Gamer · Épica E2 «Metas y rachas»

> Resumen del enunciado oficial para uso del agente. Solo lectura. Las reglas, nombres de campos, rangos y códigos de estado están tomados del original sin cambios. La ficha de hechos del cliente está en `ficha-cliente.md`.

## 1. Contexto

El Diario de Progreso Gamer del Proyecto 3 responde «¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?». La épica **E2 · Metas y rachas** responde: «¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?».

Todo el trabajo se hace con un agente de IA (Claude Code) dentro de un harness preparado por el estudiante, siguiendo la cadena Spec-Driven Development:

```
diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs → código con tests → auditoría
```

Se evalúa **producto y proceso**. El proceso debe poder verificarse en el repositorio: los documentos existen, son coherentes entre sí y aparecen en el historial de Git **antes** que el código que implementan.

Patrón reutilizado: **Meta** es la entidad nueva, referencia a un Videojuego y embebe sus hitos. El progreso semanal se calcula en el servicio del backend a partir de las Partidas existentes.

## 2. Punto de partida y restricciones

- Se parte del repositorio propio del Proyecto 3 (backend Express + TypeScript + Mongoose, frontend React + TypeScript + Vite, despliegue en Render).
- Si el Proyecto 3 quedó incompleto, se parte de lo que funcione. El diagnóstico documenta lo que falta y decide qué se completa y qué queda como deuda.
- Todo el trabajo va en la rama `feature/e2-metas-rachas`, integrada a `main` mediante pull request al final.
- Herramientas: Claude Code en la terminal, Git, Node 20 o superior, MongoDB Atlas y Render.

**No cambia respecto al Proyecto 3:** el modelo de Videojuego y Partida, el resumen de `GET /api/videojuegos/:id/resumen`, la arquitectura por capas (modelos, servicios, controladores, rutas y middlewares) y el manejo centralizado de errores. Solo se modifican si el diagnóstico encuentra un problema y se decide arreglarlo.

## 3. Ficha de hechos del cliente

Ver `ficha-cliente.md`. Es la fuente del producto y la base del PRD. No se inventa producto: lo que no está en la ficha es un supuesto o un hueco que hay que resolver y documentar.

## 4. Huecos que se deben resolver y documentar

Cada hueco debe aparecer en el PRD con una **decisión tomada (regla de negocio)** o como **punto abierto justificado**, y las decisiones deben llegar a los criterios de aceptación y a los tests.

1. **Racha y día de hoy:** si hoy todavía no hay partida pero ayer sí, ¿la racha sigue viva o ya se rompió?
2. **Varias partidas el mismo día:** ¿cuentan como uno o varios días jugados?
3. **Partida que cruza la medianoche:** ¿a qué día pertenece?
4. **Cambio de meta a mitad de semana:** ¿el porcentaje de la semana se calcula con la meta nueva o con la anterior?
5. **Meta superada:** si se juegan 7 horas con una meta de 5, ¿el porcentaje es 140 % o se limita a 100 %?
6. **Hito ya alcanzado:** si después se registra una partida con menos avance, ¿el hito deja de estar alcanzado?
7. **Videojuego completado o abandonado:** ¿puede tener meta activa?
8. **Eliminar un videojuego con meta:** ¿qué pasa con su meta y sus hitos?

El agente debe ayudar a encontrar estos huecos en el descubrimiento. Si encuentra otros, también se documentan.

## 5. Modelo de datos

Videojuego y Partida se mantienen como en el Proyecto 3. Se agrega una colección.

### Meta (nueva)

| Campo | Tipo | Regla |
|---|---|---|
| `videojuego` | ObjectId, `ref: Videojuego` | Obligatorio |
| `horasSemanales` | number | Obligatorio, mayor que 0 y como máximo 100 |
| `diasPorSemana` | number entero | Obligatorio, entre 1 y 7 |
| `activa` | boolean | Por defecto `true`. Un videojuego tiene como máximo **una** meta activa |
| `hitos` | arreglo embebido de `{ descripcion: string, porcentajeObjetivo: number }` | `porcentajeObjetivo` entre 1 y 100; máximo 5 elementos |
| `createdAt`, `updatedAt` | timestamps | |

### Justificación esperada (se defiende con palabras propias en el PRD o la spec)

- **Meta se referencia, no se embebe en Videojuego:** tiene su propio ciclo de vida (se crea, se reemplaza y se desactiva sin tocar la ficha del juego) y conserva un historial de metas anteriores.
- **Los hitos se embeben:** son una lista corta y acotada que solo tiene sentido dentro de su meta.
- **El estado «alcanzado» de un hito no se guarda:** se calcula con el porcentaje de avance actual del juego, para no duplicar un dato que ya existe en las partidas. Si la decisión del hueco 6 dice lo contrario, se documenta por qué.

## 6. Progreso semanal calculado

`GET /api/videojuegos/:id/progreso-semanal`

```json
{
  "semana": { "inicio": "2026-11-02", "fin": "2026-11-08" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 3.5,
  "porcentajeHoras": 70,
  "diasJugadosSemana": 3,
  "rachaActual": 4,
  "mejorRacha": 9,
  "hitos": [
    { "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25, "alcanzado": true },
    { "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50, "alcanzado": true },
    { "descripcion": "Terminar el juego", "porcentajeObjetivo": 100, "alcanzado": false }
  ]
}
```

### Reglas fijas

- La semana va de **lunes a domingo** en la zona horaria **America/Guayaquil**.
- `horasSemana` = suma de `duracionMinutos` de las partidas de la semana actual, dividida entre 60 y redondeada a **un decimal**.
- `porcentajeHoras` = `horasSemana / horasSemanales × 100`, redondeado a **entero**. El límite superior depende de la decisión del hueco 5.
- `diasJugadosSemana` = días distintos de la semana actual con al menos una partida.
- `rachaActual` y `mejorRacha` se calculan sobre **todo el historial** de partidas del videojuego.
- Un hito está alcanzado cuando `porcentajeAvanceActual` del resumen del Proyecto 3 es **mayor o igual** que su `porcentajeObjetivo`.
- **Sin meta activa:** `meta: null` y `porcentajeHoras: null`, pero sí calcula horas, días y rachas.
- **Sin partidas:** horas, días y rachas en 0, y ningún hito alcanzado.
- **Videojuego inexistente:** 404. **Id con formato inválido:** 400.

### Reglas que dependen de decisiones propias

Límite del porcentaje (hueco 5), si la racha sigue viva cuando hoy no hay partida (hueco 1), a qué día pertenece una partida que cruza la medianoche (hueco 3) y con qué meta se calcula una semana en la que la meta cambió (hueco 4).

### Dónde va el cálculo

La semana, la racha y los hitos se calculan con **funciones puras** (sin base de datos) en una **capa de dominio**, por ejemplo `src/dominio/progreso.ts`. El servicio solo consulta los datos y llama a esas funciones. Al registrar, editar o eliminar una partida, la interfaz vuelve a consultar el progreso; no se exige WebSocket.

## 7. Requerimientos

### 7.1 Harness

| Elemento | Requisito |
|---|---|
| `AGENTS.md` | Máximo **60 líneas**: proyecto, stack, estructura de carpetas, comandos, convenciones y reglas. Reglas mínimas: nunca leer ni modificar `.env`; ninguna funcionalidad sin una spec en `docs/specs/`; ejecutar los tests antes de dar una tarea por terminada. Menciona `DESIGN.md` en una sección de frontend, sin copiarlo |
| `CLAUDE.md` | Una sola línea: `@AGENTS.md` |
| Skill | Al menos una en `.claude/skills/` (por ejemplo `/commit` o `/nueva-spec`). Si tiene efectos sobre el repositorio, usa `disable-model-invocation: true` |
| Hook | Al menos uno en `.claude/settings.json` (por ejemplo formato con Prettier en `PostToolUse`). Un segundo hook que bloquee la edición de `.env` con `PreToolUse` suma en la rúbrica |
| `DESIGN.md` | En la raíz: colores, tipografía, espaciado, componentes, tono de los textos, accesibilidad y una sección «no hacemos» |

### 7.2 Documentación SDD (`docs/`)

| Archivo | Contenido mínimo |
|---|---|
| `docs/diagnostico.md` | Estado del Proyecto 3, tabla de problemas (bloquea / se difiere) y decisiones tomadas |
| `docs/prd/` | PRD actualizado con la épica E2: problema, usuarios, objetivo y métrica, alcance, no-alcance, reglas de negocio (con los 8 huecos resueltos), supuestos y puntos abiertos. **Sin detalle técnico** |
| `docs/backlog/epicas.md` | E1 (lo existente del Proyecto 3) y E2 · Metas y rachas, con objetivo y alcance de cada una |
| `docs/backlog/E2-metas-y-rachas.md` | Historias «Como / quiero / para» que cumplen **INVEST**, criterios **DADO / CUANDO / ENTONCES** sin detalle técnico, y tickets con id, tipo, Definition of Done y dependencias |
| `docs/specs/` | Al menos **dos** specs: backend (Meta y progreso semanal) y frontend. Cada una con reglas DEBE / NO DEBE, tabla criterio → verificación y tabla ticket → archivos |
| `docs/AUDITORIA.md` | Una fila por criterio de cada spec: cómo se verificó, resultado y evidencia |
| `docs/bitacora-agente.md` | De **5 a 8** momentos clave con el agente: qué se pidió, qué hizo mal o bien y cómo se corrigió |

### 7.3 Backend

- Modelo `Meta` con las validaciones del modelo de datos y timestamps.
- CRUD de Meta: crear, consultar por id, listar las metas de un videojuego, actualizar y desactivar.
- Validar que el videojuego exista al crear una meta. Rechazar una segunda meta activa para el mismo videojuego con **409 Conflict** y un mensaje claro.
- Endpoint `GET /api/videojuegos/:id/progreso-semanal` con las reglas de la sección 6 y las decisiones del PRD.
- Funciones puras de dominio para semana, días jugados, racha e hitos, con **tests automatizados** (Vitest, o `node:test` con `tsx`). Al menos un test por criterio de la spec verificable sin base de datos.
- Extender la política de eliminación del Proyecto 3 a las metas: eliminar un videojuego no deja metas huérfanas.
- El errorHandler centralizado distingue **400, 404, 409 y 500**.

### 7.4 Frontend

- En el detalle del videojuego, una sección de progreso semanal con: barra de horas frente a la meta, días jugados frente a días objetivo, racha actual, mejor racha y lista de hitos con su estado.
- Formulario para crear y editar la meta, con sus hitos, y acción para desactivarla con confirmación.
- Servicio `metasApi.ts` separado de los componentes.
- Estados de carga, error y vacío. El caso «sin meta activa» invita a crear una.
- El progreso se vuelve a consultar al registrar, editar o eliminar una partida.
- Estilos solo desde las variables definidas a partir de `DESIGN.md`. Sin librerías de UI que `DESIGN.md` no autorice.

### 7.5 Deuda técnica

- Pagar **al menos dos** problemas del diagnóstico con el ciclo completo: criterio de aceptación, test, código y verificación.
- El resto queda en una sección «Deuda técnica» del backlog, cada uno con su motivo para diferirlo.

### 7.6 Despliegue

- Los mismos servicios del Proyecto 3 en Render, actualizados con la épica E2. MongoDB permanece en Atlas.
- `.env` fuera de Git y `.env.example` actualizado sin credenciales reales.

### 7.7 Trazabilidad en Git

- Cada spec se commitea **antes** que el código que la implementa.
- Los mensajes de commit de implementación nombran su ticket, por ejemplo `feat(E2): T-03 endpoint de progreso semanal`.
- La descripción del pull request lista los tickets incluidos y enlaza `docs/AUDITORIA.md`.

## 8. Fases y evidencia

Cada fase termina con un commit. El historial de Git debe mostrar este orden.

| # | Fase | Qué se hace | Evidencia |
|---|---|---|---|
| 1 | Diagnóstico | En plan mode, el agente lee el repositorio (código, README y pruebas) y entrega el estado y una tabla de problemas. El estudiante decide qué bloquea E2 y qué se difiere | `docs/diagnostico.md` |
| 2 | Harness | `AGENTS.md` y `CLAUDE.md` a partir del diagnóstico, una skill y un hook. Se comprueba con `/` y `/hooks`. `DESIGN.md` con la identidad visual del frontend o una nueva | Los archivos y una captura de `/hooks` |
| 3 | Producto: PRD y épicas | Con la ficha, el agente busca huecos en plan mode. El estudiante resuelve los 8 huecos (y los que encuentre el agente) y actualiza el PRD sin detalle técnico | `docs/prd/` y `docs/backlog/epicas.md` |
| 4 | Backlog | Descomponer E2 en historias, criterios DADO / CUANDO / ENTONCES y tickets con tipo, Definition of Done y dependencias | `docs/backlog/E2-metas-y-rachas.md` |
| 5 | Specs | Spec del backend y del frontend, con tabla criterio → verificación y tabla ticket → archivos. **Todavía no hay código** | `docs/specs/` |
| 6 | Backend por tickets | En plan mode, el agente prepara un plan que sigue el orden de los tickets: primero los tests de dominio, después el código. Se valida el endpoint con un videojuego sin partidas, otro con al menos **cinco partidas en días distintos y una racha rota**, y se provocan errores 400, 404 y 409 | Tests pasando y tabla de pruebas con curl o Thunder Client |
| 7 | Frontend | Sección de progreso y formulario de meta según la spec y `DESIGN.md`. Revisión de diseño con el agente contra `DESIGN.md` y corrección de desviaciones | Commits por ticket y tabla de revisión de diseño |
| 8 | Deuda técnica | Pagar al menos dos problemas del diagnóstico y anotar el resto en el backlog | Un commit por problema pagado, con su test |
| 9 | Auditoría, despliegue y PR | Auditar las dos specs, marcar tickets terminados en el backlog, desplegar en Render e integrar la rama con un pull request | `docs/AUDITORIA.md`, URLs públicas y PR integrado |
| 10 | Demo | Ver sección 9 | Demo en vivo o grabada |

## 9. Demo (máximo 6 minutos)

Debe mostrar:

1. Crear una meta con hitos.
2. Registrar partidas y ver cómo cambian el progreso y la racha.
3. Alcanzar un hito.
4. Provocar el error 409 de meta duplicada.
5. Recorrer la trazabilidad de un criterio de punta a punta: PRD → historia → ticket → spec → test → código → auditoría.

## 10. Checklist de entregables finales

Los requisitos de contenido están en la sección 7; esto solo lista lo que debe existir al entregar.

- [ ] Repositorio de GitHub con `feature/e2-metas-rachas` integrada a `main` mediante pull request, y un historial donde cada spec aparece antes que su código.
- [ ] Harness completo: `AGENTS.md`, `CLAUDE.md`, al menos una skill, al menos un hook y `DESIGN.md`.
- [ ] Documentación en `docs/`: diagnóstico, PRD, épicas, backlog de E2, specs, auditoría y bitácora del agente.
- [ ] Tests automatizados de las funciones de dominio, pasando.
- [ ] URLs públicas de frontend y API en Render, con la épica E2 funcionando.
- [ ] README actualizado con la sección **«Cómo trabajamos con el agente»**: el harness, el flujo seguido y dónde encontrar cada documento.
- [ ] `.env.example` actualizado y sin secretos.
- [ ] Demo de máximo 6 minutos con el flujo de la sección 9.
- [ ] Nota breve en la bitácora sobre **un momento en que el agente se desvió de la spec y cómo se detectó**.

## 11. Objetivos de aprendizaje (referencia)

Diagnosticar un proyecto existente y decidir qué se arregla y qué se difiere; configurar un harness (AGENTS.md, skill, hook, DESIGN.md); recorrer la cadena SDD; convertir decisiones del cliente en reglas, criterios y tests; implementar un cálculo de dominio con funciones puras separado del acceso a datos; auditar contra las specs manteniendo la trazabilidad en Git; y pagar deuda técnica con el ciclo completo.