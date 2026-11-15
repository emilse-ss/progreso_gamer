# Spec · Backend de metas y progreso semanal

- **Épica:** E2 · Metas y rachas
- **Historias:** HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-09, HU-10, HU-11, HU-12, HU-13
- **Tickets:** T-01 a T-13, T-19, T-20, T-21
- **Estado:** borrador
- **Fuentes:** `docs/prd/PRD.md` (R-01 a R-23), `docs/backlog/E2-metas-y-rachas.md` (CA y T), `docs/diagnostico.md` (D-XX). Las decisiones técnicas D-T01 a D-T15 se aprobaron en la fase 5.

## 1. Objetivo y alcance

La API permite fijar una meta semanal por videojuego (crearla, consultarla, listarla, editarla, desactivarla y reactivarla) y calcula el **progreso de la semana actual**: horas y días frente a la meta, racha actual, mejor racha, hitos y si la meta está cumplida. Todo se calcula con funciones puras del dominio en hora de Ecuador.

La spec también cubre:

- La cascada de eliminación hacia las metas (R-21).
- La desactivación automática de la meta al completar o abandonar un juego (R-20).
- Dos deudas pagadas: el avance actual fiable (D-03) y la validación de partidas (D-10 y D-02).

| Tickets                                                                                                                                                                                                                  | Reglas      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| T-01 (test runner), T-02 a T-06 y T-21 (dominio), T-07 (modelo), T-08 (errores), T-09 (CRUD de Meta), T-10 (progreso), T-11 (cascada), T-12 (cambio de estado), T-13 (pruebas con curl), T-19 (D-03), T-20 (D-10 y D-02) | R-01 a R-23 |

El frontend (HU-08, formularios, estados de la interfaz) va en `E2-frontend-metas-progreso.md`. T-19 y T-20 tocan también `PartidaForm.tsx`, y esos cambios se listan aquí porque son parte de la misma deuda.

## 2. Reglas

### DEBE

- **DEBE-1:** las funciones de cálculo (semana, días, horas, porcentaje, racha, hitos, cumplimiento y validación de partida) viven en `backend/src/dominio/` y son **puras**: reciben todo por parámetro, incluido `ahora: Date`, y devuelven valores sin efectos secundarios.
- **DEBE-2:** el día de un instante se obtiene con `Intl.DateTimeFormat` y la zona `America/Guayaquil`, y se representa como texto `YYYY-MM-DD` (D-T06, D-T07). El nombre de la zona aparece en un único lugar del código, `dominio/fechas.ts` (R-01).
- **DEBE-3:** el único `new Date()` del flujo de progreso está en el servicio de progreso, que lo pasa al dominio como `ahora`.
- **DEBE-4:** un videojuego tiene como máximo una meta activa, con doble defensa (D-T04): una validación en el servicio (409 con mensaje específico) y un índice único parcial en la base de datos (R-13).
- **DEBE-5:** el servicio de metas traduce el error de clave duplicada (código 11000) a un 409 con mensaje específico. Además, el `errorHandler` traduce cualquier error con `code === 11000` a un 409 genérico, como red de seguridad (D-05, D-T05).
- **DEBE-6:** las validaciones siguen la convención de D-07 (D-T11):
  - **Controlador:** forma del cuerpo, tipos y campos desconocidos.
  - **Servicio:** formato de ids, existencia del videojuego o de la meta, estado del juego, una sola meta activa, edición solo de la activa, objetivos de hito repetidos y orden de los hitos.
  - **Esquema:** obligatoriedad, enteros y rangos, y como máximo 5 hitos.
- **DEBE-7:** toda actualización de Meta usa `runValidators: true` (D-08). La edición es atómica: `findOneAndUpdate({ _id, activa: true }, { $set }, { new: true, runValidators: true })` (D-T12).
- **DEBE-8:** los hitos se guardan ordenados de menor a mayor objetivo y se devuelven en ese orden (R-16).
- **DEBE-9:** el progreso evalúa la semana con la meta activa **en el momento de la consulta**, usando solo `horasSemanales`, `diasPorSemana` e `hitos` (R-10).
- **DEBE-10:** el avance actual del progreso es el `porcentajeAvanceActual` del resumen existente (D-T13). Con T-19, el resumen toma la partida más reciente **que tenga avance** (R-18, D-03).
- **DEBE-11:** al eliminar un videojuego se borran, en este orden, sus partidas, sus metas (activas e inactivas) y el videojuego (R-21, D-T10).
- **DEBE-12:** al actualizar un videojuego a `completado` o `abandonado`, su meta activa pasa a `activa: false` (R-20). Los cambios a `pausado` o `jugando` no tocan las metas (supuestos del backlog).
- **DEBE-13:** una partida nueva exige:
  - `fecha` ISO con hora y zona (`Z` o `±hh:mm`);
  - un día de Ecuador no posterior a hoy;
  - `duracionMinutos` entre 5 y 1440;
  - `porcentajeAvance` obligatorio (R-22, R-18, D-T08).
- **DEBE-14:** las respuestas mantienen el formato actual: `{ meta, requestId }`, `{ total, metas, requestId }` y errores como `{ error, requestId }`.

### NO DEBE

- **NO-DEBE-1:** el dominio no importa `mongoose`, `express` ni nada de `models/`, `services/` o `controllers/`, y no llama a `Date.now()` ni a `new Date()` sin argumentos.
- **NO-DEBE-2:** no se guarda el estado «alcanzado» de un hito: se calcula en cada consulta (enunciado §5).
- **NO-DEBE-3:** el cálculo del progreso no usa `createdAt` ni `updatedAt` de la meta (R-10).
- **NO-DEBE-4:** no se cambia el resumen existente más allá de lo aprobado como deuda D-03 (T-19). Sus totales y horas siguen contando todas las partidas.
- **NO-DEBE-5:** no se borra ninguna meta salvo por la cascada de R-21. No existe una ruta para borrar metas (R-15).
- **NO-DEBE-6:** no se añaden dependencias salvo `vitest` como devDependency del backend (T-01). No se añade ningún parámetro `?ahora=` a la API.
- **NO-DEBE-7:** la meta no puede cambiar de videojuego, ni su campo `activa` se modifica con la edición: para eso están las acciones explícitas (R-14, D-T02).

## 3. Contrato

### 3.1 Modelo `Meta` (`backend/src/modelos/Meta.model.ts`)

| Campo                    | Tipo                                                                                                 | Regla                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `videojuego`             | ObjectId, `ref: "Videojuego"`                                                                        | Obligatorio. No se modifica después de crear                                                                                                                                         |
| `horasSemanales`         | Number                                                                                               | Obligatorio, **entero** de 1 a 100 (R-12)                                                                                                                                            |
| `diasPorSemana`          | Number                                                                                               | Obligatorio, **entero** de 1 a 7 (R-12)                                                                                                                                              |
| `activa`                 | Boolean                                                                                              | Por defecto `true`                                                                                                                                                                   |
| `hitos`                  | Arreglo de `{ descripcion: String (trim), porcentajeObjetivo: Number }`, subesquema con `_id: false` | De 0 a 5 elementos; `descripcion` obligatoria, de 1 a 100 caracteres después del trim (R-16, S-06); `porcentajeObjetivo` obligatorio, **entero** de 1 a 100 (R-16). Por defecto `[]` |
| `createdAt`, `updatedAt` | Date                                                                                                 | `timestamps: true`                                                                                                                                                                   |

**Índice:** `{ videojuego: 1 }` con `unique: true`, `partialFilterExpression: { activa: true }` y nombre `meta_activa_unica_por_videojuego`.

Los mensajes de validación del esquema van en español, siguiendo el estilo de `Partida.model.ts`:

- «Las horas semanales deben ser un número entero entre 1 y 100».
- «Los días por semana deben ser un número entero entre 1 y 7».
- «Una meta admite como máximo 5 hitos».
- «El objetivo de un hito debe ser un número entero entre 1 y 100».
- «La descripción del hito es obligatoria» (`required`, también si después del trim queda vacía).
- «La descripción del hito admite como máximo 100 caracteres» (`maxlength: 100`).

**Ejemplo de documento serializado (`meta`):**

```json
{
  "_id": "6745a1f0c2b1e4a9d0f00001",
  "videojuego": "6745a1f0c2b1e4a9d0f0aaaa",
  "horasSemanales": 5,
  "diasPorSemana": 4,
  "activa": true,
  "hitos": [
    { "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25 },
    { "descripcion": "Mitad", "porcentajeObjetivo": 50 }
  ],
  "createdAt": "2026-11-09T15:00:00.000Z",
  "updatedAt": "2026-11-09T15:00:00.000Z"
}
```

### 3.2 Rutas de Meta (D-T01, D-T02)

Todos los errores tienen la forma `{ "error": "<mensaje>", "requestId": "<id>" }`. Si el id tiene un formato inválido, responden 400 con el mensaje `El identificador de <meta|videojuego> no tiene un formato válido`. Cualquier error inesperado responde 500 con «Error interno del servidor».

#### `POST /api/metas`: crear (HU-01)

**Cuerpo:** `{ "videojuego": string, "horasSemanales": number, "diasPorSemana": number, "hitos"?: [{ "descripcion": string, "porcentajeObjetivo": number }] }`. El controlador comprueba que `descripcion` sea texto y el esquema aplica `trim`, `required` y `maxlength: 100`. Una descripción vacía, formada solo por espacios o de más de 100 caracteres responde 400 (CA-01.8).

| Código  | Cuándo                                                                   | Mensaje                                                                                           |
| ------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **201** | Meta creada                                                              | `{ "meta": {…}, "requestId": "…" }`, con los hitos ordenados                                      |
| 400     | El cuerpo no es un objeto, hay un campo desconocido o un tipo incorrecto | «El cuerpo debe ser un objeto JSON» / «El campo `<x>` no está permitido» / «`<campo>` debe ser …» |
| 400     | Incumple los rangos del esquema (R-12, R-16)                             | Mensaje del esquema (ver §3.1)                                                                    |
| 400     | Hay objetivos de hito repetidos (R-16)                                   | «No puede haber dos hitos con el mismo objetivo (50 %)»                                           |
| 404     | El videojuego no existe                                                  | «Videojuego no encontrado»                                                                        |
| 409     | El juego está completado o abandonado (R-19)                             | «El videojuego está completado: no puede tener una meta activa» (o «abandonado»)                  |
| 409     | Ya hay una meta activa, comprobado en el servicio o por E11000 (R-13)    | «Este videojuego ya tiene una meta activa»                                                        |

#### `GET /api/videojuegos/:id/metas`: listar las metas del juego (HU-03)

- **200:** `{ "total": n, "metas": [ … ], "requestId": "…" }`, con la meta activa primero y las inactivas ordenadas por `updatedAt` descendente.
- **400:** id inválido.
- **404:** «Videojuego no encontrado».

#### `GET /api/metas/:id`: consultar una meta

- **200:** `{ "meta": {…}, "requestId": "…" }`.
- **400:** id inválido.
- **404:** «Meta no encontrada».

#### `PATCH /api/metas/:id`: editar la meta activa (HU-02)

**Cuerpo:** al menos uno de `horasSemanales`, `diasPorSemana` e `hitos`. `hitos` sustituye la lista completa.

| Código  | Cuándo                                               | Mensaje                                                |
| ------- | ---------------------------------------------------- | ------------------------------------------------------ |
| **200** | Meta editada                                         | `{ "meta": {…}, "requestId": "…" }`                    |
| 400     | El cuerpo está vacío o no trae ningún campo editable | «Debe indicar horasSemanales, diasPorSemana y/o hitos» |
| 400     | Trae `videojuego` o `activa` (R-14, NO-DEBE-7)       | «El campo `<x>` no se puede modificar»                 |
| 400     | Rangos u objetivos repetidos                         | Igual que al crear                                     |
| 404     | La meta no existe                                    | «Meta no encontrada»                                   |
| 409     | La meta está inactiva (R-14)                         | «Solo se puede editar la meta activa»                  |

#### `PATCH /api/metas/:id/desactivar` (HU-03)

Sin cuerpo; si llega uno, se ignora.

- **200:** `{ "meta": { …, "activa": false }, "requestId": "…" }`.
- **400:** id inválido.
- **404:** «Meta no encontrada».
- **409:** «La meta ya está inactiva». El frontend, al recibirlo, vuelve a consultar las metas y el progreso del juego para mostrar el estado real.

#### `PATCH /api/metas/:id/reactivar` (HU-03)

Sin cuerpo.

| Código  | Cuándo                                                                          | Mensaje                                                         |
| ------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **200** | Meta reactivada                                                                 | `{ "meta": { …, "activa": true }, "requestId": "…" }`           |
| 404     | La meta no existe                                                               | «Meta no encontrada»                                            |
| 409     | La meta ya está activa                                                          | «La meta ya está activa»                                        |
| 409     | Hay otra meta activa en el juego, comprobado en el servicio o por E11000 (R-13) | «Este videojuego ya tiene otra meta activa»                     |
| 409     | El juego está completado o abandonado (R-19)                                    | «El videojuego está abandonado: no puede tener una meta activa» |

### 3.3 `GET /api/videojuegos/:id/progreso-semanal` (HU-04 a HU-07, HU-13)

Tiene **exactamente el formato del enunciado (§6)**, con **una sola extensión**: `metaCumplida`, justificada por R-09 y D-T03. Como el resto de la API, la respuesta incluye `requestId` en el nivel superior.

**Con meta activa.** Ejemplo del dataset B de §7, consultado el domingo 15 de noviembre de 2026:

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
  "requestId": "…"
}
```

**Sin meta activa** (R-11, CA-07.1). Se calculan horas, días y rachas:

```json
{
  "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" },
  "meta": null,
  "horasSemana": 2,
  "porcentajeHoras": null,
  "diasJugadosSemana": 1,
  "rachaActual": 0,
  "mejorRacha": 1,
  "hitos": [],
  "metaCumplida": null,
  "requestId": "…"
}
```

**Con meta y sin partidas** (R-11, CA-07.2):

```json
{
  "semana": { "inicio": "2026-11-16", "fin": "2026-11-22" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 3 },
  "horasSemana": 0,
  "porcentajeHoras": 0,
  "diasJugadosSemana": 0,
  "rachaActual": 0,
  "mejorRacha": 0,
  "hitos": [
    {
      "descripcion": "Llegar al 25 %",
      "porcentajeObjetivo": 25,
      "alcanzado": false
    }
  ],
  "metaCumplida": false,
  "requestId": "…"
}
```

**Sin meta y sin partidas:** todo en 0, `meta: null`, `porcentajeHoras: null`, `hitos: []` y `metaCumplida: null`.

**Errores:**

- 400: «El identificador de videojuego no tiene un formato válido».
- 404: «Videojuego no encontrado».
- 500: «Error interno del servidor».

### 3.4 Cambios en rutas existentes

| Ruta                                 | Cambio                                                                                                                                                                                                                | Ticket     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `POST /api/partidas`                 | Nuevos 400: «La fecha debe incluir la hora y la zona horaria» · «La fecha no puede ser de un día posterior a hoy (hora de Ecuador)» · «duracionMinutos debe estar entre 5 y 1440» · «porcentajeAvance es obligatorio» | T-20, T-19 |
| `GET /api/videojuegos/:id/resumen`   | `porcentajeAvanceActual` = avance de la partida más reciente **que tenga avance**, o 0 si ninguna lo tiene. `totalPartidas`, `horasTotales` y `ultimaPartida` no cambian                                              | T-19       |
| `PUT` / `PATCH /api/videojuegos/:id` | Si `estado` pasa a `completado` o `abandonado`, se desactiva la meta activa. La respuesta no cambia                                                                                                                   | T-12       |
| `DELETE /api/videojuegos/:id`        | También elimina las metas. La respuesta sigue siendo 204                                                                                                                                                              | T-11       |
| Todas                                | E11000 → 409 «Ya existe un registro con esos datos» (red de seguridad)                                                                                                                                                | T-08       |

### 3.5 Funciones de dominio (`backend/src/dominio/`)

**Tipos comunes:**

```ts
type Dia = string; // "YYYY-MM-DD", día del calendario en America/Guayaquil
interface PartidaDominio {
  fecha: Date;
  duracionMinutos: number;
}
interface HitoDominio {
  descripcion: string;
  porcentajeObjetivo: number;
}
interface HitoEvaluado extends HitoDominio {
  alcanzado: boolean;
}
interface MetaDominio {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: HitoDominio[];
}
interface Semana {
  inicio: Dia;
  fin: Dia;
}
```

| Archivo           | Función                                                                                                                                           | Regla y ejemplo del backlog                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fechas.ts`       | `diaEcuador(instante: Date): Dia`                                                                                                                 | R-02. `2026-11-15T04:30:00Z` (sábado 14 a las 23:30 en Ecuador) → `"2026-11-14"`, no `"2026-11-15"`. `2026-11-16T04:30:00Z` (domingo 15 a las 23:30) → `"2026-11-15"` (CA-04.2, CA-04.3)                                                                                                                                                                                                                                                           |
| `fechas.ts`       | `sumarDias(dia: Dia, n: number): Dia`                                                                                                             | `sumarDias("2026-11-15", 1)` → `"2026-11-16"`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `fechas.ts`       | `semanaDe(ahora: Date): Semana`                                                                                                                   | R-01. Para cualquier instante del lunes 9 a las 00:00 al domingo 15 a las 23:59 en Ecuador, devuelve `{ "2026-11-09", "2026-11-15" }`. El lunes 16 a las 00:10 devuelve `{ "2026-11-16", "2026-11-22" }` (CA-04.1)                                                                                                                                                                                                                                 |
| `fechas.ts`       | `partidasHastaHoy<T extends PartidaDominio>(partidas: T[], ahora: Date): T[]`                                                                     | R-23. Descarta las partidas cuyo día es posterior a `diaEcuador(ahora)` y conserva las de hoy aunque su hora sea posterior (CA-04.8, CA-04.9, CA-05.7)                                                                                                                                                                                                                                                                                             |
| `semana.ts`       | `horasYDiasSemana(partidas: PartidaDominio[], semana: Semana): { horasSemana: number; diasJugadosSemana: number }`                                | R-03, R-07. Suma los minutos de las partidas cuyo día está en la semana, divide entre 60 y redondea a 1 decimal (mitad hacia arriba). Cuenta los días distintos. 60 + 45 + 30 min el martes 10 → `{ 2.3, 1 }` (CA-04.3)                                                                                                                                                                                                                            |
| `semana.ts`       | `porcentajeHoras(horasSemana: number, horasSemanales: number): number`                                                                            | R-08. `min(100, round(horasSemana / horasSemanales × 100))`. 3.5 / 5 → 70; 7 / 5 → 100; 5.0 / 5 → 100; 4 / 10 → 40 (CA-04.4 a CA-04.6, CA-02.4)                                                                                                                                                                                                                                                                                                    |
| `racha.ts`        | `rachas(partidas: PartidaDominio[], ahora: Date): { rachaActual: number; mejorRacha: number }`                                                    | R-04 a R-06. Calcula sobre los días distintos de `partidasHastaHoy`. La racha actual empieza a contar desde **hoy** si hay partida hoy, o desde **ayer** si no la hay pero ayer sí (R-05); si no hay ninguna de las dos, es 0. Mejor racha = la secuencia de días consecutivos más larga. Partidas del jueves 12 al sábado 14: el domingo 15 a las 10:00 → `{ 3, 3 }`; el martes 17 → `{ 0, 3 }`; del 1 al 9 y del 12 al 15 → `{ 4, 9 }` (CA-05.x) |
| `hitos.ts`        | `ordenarHitos(hitos: HitoDominio[]): HitoDominio[]`                                                                                               | R-16. 100, 25, 50 → 25, 50, 100 (CA-01.3, CA-06.4)                                                                                                                                                                                                                                                                                                                                                                                                 |
| `hitos.ts`        | `objetivoRepetido(hitos: HitoDominio[]): number \| null`                                                                                          | R-16. [50, 25, 50] → 50; [25, 50] → null (CA-01.4)                                                                                                                                                                                                                                                                                                                                                                                                 |
| `hitos.ts`        | `evaluarHitos(hitos: HitoDominio[], avanceActual: number): HitoEvaluado[]`                                                                        | R-17. Ordena y marca `alcanzado = avanceActual >= porcentajeObjetivo`. Con 55: [25 ✓, 50 ✓, 100 ✗]; con 40: [25 ✓, 50 ✗]; con 50 en un hito de 50: ✓ (CA-06.1 a CA-06.3)                                                                                                                                                                                                                                                                           |
| `cumplimiento.ts` | `metaCumplida(meta: MetaDominio, porcentaje: number, diasJugados: number): boolean`                                                               | R-09. `porcentaje >= 100 && diasJugados >= meta.diasPorSemana`. (100, 4/4) → true; (100, 1/4) → false; (80, 4/4) → false (CA-13.1 a CA-13.4)                                                                                                                                                                                                                                                                                                       |
| `progreso.ts`     | `calcularProgresoSemanal(entrada: { partidas: PartidaDominio[]; meta: MetaDominio \| null; avanceActual: number; ahora: Date }): ProgresoSemanal` | Compone las funciones anteriores. Sin meta → `meta: null`, `porcentajeHoras: null`, `hitos: []`, `metaCumplida: null` (R-11). Sin partidas → horas, días y rachas en 0. `ProgresoSemanal` = respuesta de §3.3 sin `requestId`                                                                                                                                                                                                                      |
| `partida.ts`      | `fechaConHoraYZona(texto: string): boolean`                                                                                                       | R-22. `"2026-11-14T23:30:00-05:00"` y `"2026-11-15T04:30:00.000Z"` → true; `"2026-11-10"` → false (CA-11.3)                                                                                                                                                                                                                                                                                                                                        |
| `partida.ts`      | `validarPartidaNueva(entrada: { fecha: Date; duracionMinutos: number }, ahora: Date): string \| null`                                             | R-22. Devuelve el mensaje de error o `null`. Con ahora = domingo 15 a las 10:00: domingo 15 a las 18:00 → null; lunes 16 a las 09:00 → mensaje de «día posterior»; 3 o 1441 min → mensaje de rango; 5 y 1440 → null (CA-11.1, CA-11.2, CA-11.4)                                                                                                                                                                                                    |

El servicio de progreso (`services/progreso.service.ts`) hace, en este orden:

1. Valida el id y comprueba que el juego existe.
2. Carga las partidas del juego (solo `fecha` y `duracionMinutos`).
3. Carga la meta activa.
4. Obtiene `porcentajeAvanceActual` llamando a `obtenerResumen(id)`.
5. Llama a `calcularProgresoSemanal({ …, ahora: new Date() })`.

## 4. Criterio → verificación

Los tests unitarios se llaman `"CA-XX.Y <descripción>"` y se ejecutan con `npm test`, en `backend/`. Las verificaciones por curl o Thunder Client usan los datasets de §6 y se registran en `docs/pruebas-api-E2.md` (T-13). «Spec frontend» remite a `E2-frontend-metas-progreso.md`.

| Criterio | Tipo        | Test o comando                                                                                                                                                                                                                     | Resultado esperado                                                                                                        |
| -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| CA-01.1  | curl        | `POST /api/metas` `{ videojuego: A, horasSemanales: 5, diasPorSemana: 3 }`                                                                                                                                                         | 201; `activa: true`, 5 y 3                                                                                                |
| CA-01.2  | test        | `Meta.model.test.ts` › «CA-01.2 límites de horas y días» (`validateSync`)                                                                                                                                                          | Error en `horasSemanales` con 4.5, 0 y 120; en `diasPorSemana` con 0 y 8                                                  |
| CA-01.3  | test + curl | `hitos.test.ts` › «CA-01.3 hitos ordenados»; curl `POST` con 50, 25, 100                                                                                                                                                           | Se ordenan como [25, 50, 100]; la respuesta 201 viene en ese orden                                                        |
| CA-01.4  | test        | `Meta.model.test.ts` › «CA-01.4 hitos inválidos» (6 hitos, 33.3, 0, 101); `hitos.test.ts` › «CA-01.4 objetivo repetido»                                                                                                            | Errores de validación; `objetivoRepetido([50,25,50])` = 50                                                                |
| CA-01.5  | test + curl | `Meta.model.test.ts` › «CA-01.5 meta sin hitos»; curl `POST` sin hitos                                                                                                                                                             | Sin errores; 201                                                                                                          |
| CA-01.6  | curl        | `POST /api/metas` por segunda vez para el juego A                                                                                                                                                                                  | 409 «Este videojuego ya tiene una meta activa»; la primera meta no cambia                                                 |
| CA-01.7  | curl        | `POST /api/metas` para el juego C (`abandonado`) y para uno `completado`                                                                                                                                                           | 409 con el mensaje del estado                                                                                             |
| CA-01.8  | test + curl | `Meta.model.test.ts` › «CA-01.8 descripción obligatoria, trim y máximo 100» (vacía, solo espacios, 101 caracteres → error; « Mitad » → «Mitad»; 100 caracteres → válida); curl `POST /api/metas` con descripción de 101 caracteres | Errores de validación en los casos inválidos; 400 en el curl; el hito se guarda como «Mitad»                              |
| CA-02.1  | curl        | `PATCH /api/metas/:id` `{ horasSemanales: 8, diasPorSemana: 4, hitos: [50, 25] }`                                                                                                                                                  | 200; 8, 4 e hitos [25, 50]                                                                                                |
| CA-02.2  | curl        | `PATCH /api/metas/:idInactiva` `{ horasSemanales: 6 }`                                                                                                                                                                             | 409 «Solo se puede editar la meta activa»; los valores no cambian                                                         |
| CA-02.3  | curl        | `PATCH /api/metas/:id` `{ videojuego: B }`                                                                                                                                                                                         | 400 «El campo videojuego no se puede modificar»                                                                           |
| CA-02.4  | test        | `semana.test.ts` › «CA-02.4 la edición vale para toda la semana»                                                                                                                                                                   | `porcentajeHoras(4, 10)` = 40                                                                                             |
| CA-02.5  | test + curl | `Meta.model.test.ts` (4.5 h y 8 días); curl `PATCH` con 4.5, 8 días o hitos [50, 50]                                                                                                                                               | Errores de validación; 400 y la meta sin cambios                                                                          |
| CA-03.1  | curl        | `PATCH /api/metas/:id/desactivar` y después `GET /api/videojuegos/A/progreso-semanal`                                                                                                                                              | 200 `activa: false`; el progreso devuelve `meta: null`. La confirmación se verifica en la spec frontend                   |
| CA-03.2  | manual      | Spec frontend                                                                                                                                                                                                                      | Al cancelar el modal no se llama a la API                                                                                 |
| CA-03.3  | curl        | `GET /api/videojuegos/A/metas` con 2 metas inactivas                                                                                                                                                                               | 200; `total: 2`; cada meta con sus horas, días e hitos                                                                    |
| CA-03.4  | curl        | `PATCH /api/metas/:id/reactivar` sin otra meta activa                                                                                                                                                                              | 200 `activa: true`                                                                                                        |
| CA-03.5  | curl        | `PATCH /api/metas/:idA/reactivar` con la meta B activa                                                                                                                                                                             | 409 «Este videojuego ya tiene otra meta activa»                                                                           |
| CA-03.6  | curl        | `PATCH /api/metas/:id/reactivar` en el juego C                                                                                                                                                                                     | 409 «El videojuego está abandonado…»                                                                                      |
| CA-04.1  | test        | `fechas.test.ts` › «CA-04.1 semana de lunes a domingo»; `semana.test.ts` › «CA-04.1»                                                                                                                                               | Semana del 9 al 15 con 1.0 h y 1 día (el domingo 15 a las 21:00); semana del 16 al 22 con 0.5 h (el lunes 16 a las 10:00) |
| CA-04.2  | test        | `fechas.test.ts` + `semana.test.ts` › «CA-04.2 cruza la medianoche»                                                                                                                                                                | Partida del domingo 15 a las 23:30 de 90 min: 1.5 h en la semana del 9 al 15; 0 h en la del 16 al 22                      |
| CA-04.3  | test        | `semana.test.ts` › «CA-04.3 varias partidas el mismo día, una a las 23:30»                                                                                                                                                         | `{ horasSemana: 2.3, diasJugadosSemana: 1 }`                                                                              |
| CA-04.4  | test        | `semana.test.ts` › «CA-04.4 porcentaje de horas»                                                                                                                                                                                   | 210 min → 3.5 h; `porcentajeHoras(3.5, 5)` = 70                                                                           |
| CA-04.5  | test        | `semana.test.ts` › «CA-04.5 meta superada»                                                                                                                                                                                         | 7.0 h → 100                                                                                                               |
| CA-04.6  | test        | `semana.test.ts` › «CA-04.6 redondeo antes del porcentaje»                                                                                                                                                                         | 298 min → 5.0 h → 100                                                                                                     |
| CA-04.7  | test        | `progreso.test.ts` › «CA-04.7 partidas anteriores a la meta»                                                                                                                                                                       | 2.0 h, 40 %                                                                                                               |
| CA-04.8  | test        | `fechas.test.ts` › «CA-04.8 partida de día futuro»; `progreso.test.ts`                                                                                                                                                             | La partida del martes 17 se descarta: 1.0 h y 1 día                                                                       |
| CA-04.9  | test        | `fechas.test.ts` › «CA-04.9 partida de hoy con hora posterior»                                                                                                                                                                     | La partida del domingo 15 a las 18:00 cuenta a las 10:00: 3.0 h                                                           |
| CA-05.1  | test        | `racha.test.ts` › «CA-05.1 racha sin importar el avance»                                                                                                                                                                           | `rachaActual` = 3                                                                                                         |
| CA-05.2  | test        | `racha.test.ts` › «CA-05.2 hoy sin partida y ayer sí»                                                                                                                                                                              | 3                                                                                                                         |
| CA-05.3  | test        | `racha.test.ts` › «CA-05.3 un día completo sin partida rompe la racha»                                                                                                                                                             | `{ 0, 3 }`                                                                                                                |
| CA-05.4  | test        | `racha.test.ts` › «CA-05.4 cruza de domingo a lunes»                                                                                                                                                                               | 4                                                                                                                         |
| CA-05.5  | test        | `racha.test.ts` › «CA-05.5 mejor racha del historial»                                                                                                                                                                              | `{ 4, 9 }`                                                                                                                |
| CA-05.6  | test        | `racha.test.ts` › «CA-05.6 varias partidas el mismo día»                                                                                                                                                                           | 2                                                                                                                         |
| CA-05.7  | test        | `racha.test.ts` › «CA-05.7 día futuro no alarga la racha»                                                                                                                                                                          | `{ 3, 3 }`                                                                                                                |
| CA-06.1  | test        | `hitos.test.ts` › «CA-06.1 hitos alcanzados»                                                                                                                                                                                       | Con 55: [✓, ✓, ✗]                                                                                                         |
| CA-06.2  | test        | `hitos.test.ts` › «CA-06.2 un hito deja de estar alcanzado»                                                                                                                                                                        | Con 40: 25 ✓ y 50 ✗                                                                                                       |
| CA-06.3  | test        | `hitos.test.ts` › «CA-06.3 avance igual al objetivo»                                                                                                                                                                               | 50 ≥ 50 → ✓                                                                                                               |
| CA-06.4  | test        | `hitos.test.ts` › «CA-06.4 orden de los hitos»                                                                                                                                                                                     | [25, 50, 100]                                                                                                             |
| CA-07.1  | test + curl | `progreso.test.ts` › «CA-07.1 sin meta activa»; curl sobre el dataset B sin meta                                                                                                                                                   | `meta: null`, `porcentajeHoras: null`, `hitos: []`, 2.0 h y 1 día                                                         |
| CA-07.2  | test + curl | `progreso.test.ts` › «CA-07.2 con meta y sin partidas»; curl sobre el dataset A con meta                                                                                                                                           | 0 h, 0 %, 0 días, rachas en 0 y el hito no alcanzado                                                                      |
| CA-07.3  | test + curl | `progreso.test.ts` › «CA-07.3 sin meta y sin partidas»; curl sobre el dataset A sin meta                                                                                                                                           | Todo en 0; `meta: null`; 200 (no es un error)                                                                             |
| CA-08.1  | manual      | Spec frontend                                                                                                                                                                                                                      | —                                                                                                                         |
| CA-08.2  | manual      | Spec frontend                                                                                                                                                                                                                      | —                                                                                                                         |
| CA-09.1  | curl        | `PATCH /api/videojuegos/:id` `{ estado: "completado" }` y después `GET …/metas`                                                                                                                                                    | La meta pasa a `activa: false`                                                                                            |
| CA-09.2  | curl        | Igual, con `abandonado`                                                                                                                                                                                                            | La meta pasa a `activa: false`                                                                                            |
| CA-09.3  | curl        | Igual, con `pausado`                                                                                                                                                                                                               | La meta sigue con `activa: true`                                                                                          |
| CA-09.4  | curl        | Después de CA-09.1, `PATCH` con `{ estado: "jugando" }`                                                                                                                                                                            | Ninguna meta activa                                                                                                       |
| CA-10.1  | curl        | `DELETE /api/videojuegos/:id` (1 meta activa, 2 inactivas, 12 partidas) y después `GET /api/metas/:idX`                                                                                                                            | 204; cada `GET` de meta responde 404                                                                                      |
| CA-10.2  | curl        | Después de CA-10.1, `GET /api/videojuegos/B/metas` y `…/partidas`                                                                                                                                                                  | Las metas y las partidas de B intactas                                                                                    |
| CA-11.1  | test        | `partida.test.ts` › «CA-11.1 hoy con hora posterior»                                                                                                                                                                               | `null` (válida)                                                                                                           |
| CA-11.2  | test        | `partida.test.ts` › «CA-11.2 día futuro»                                                                                                                                                                                           | Mensaje «…posterior a hoy…»                                                                                               |
| CA-11.3  | test + curl | `partida.test.ts` › «CA-11.3 fecha sin hora»; curl `POST /api/partidas` con `"2026-11-10"`                                                                                                                                         | `false`; 400 «La fecha debe incluir la hora y la zona horaria»                                                            |
| CA-11.4  | test        | `partida.test.ts` › «CA-11.4 duración de 5 a 1440»                                                                                                                                                                                 | 3, 1441 y 3000 → mensaje; 5 y 1440 → null                                                                                 |
| CA-11.5  | test        | `progreso.test.ts` › «CA-11.5 partidas antiguas siguen contando»                                                                                                                                                                   | Una partida de 3 min suma horas, días y racha                                                                             |
| CA-12.1  | curl        | Dataset D: `GET /api/videojuegos/D/resumen` y `…/progreso-semanal`                                                                                                                                                                 | `porcentajeAvanceActual: 60`; el hito de 50 alcanzado                                                                     |
| CA-12.2  | test + curl | `Partida.model.test.ts` › «CA-12.2 porcentajeAvance es obligatorio en una partida nueva» (`validateSync()`, sin base de datos); curl `POST /api/partidas` sin `porcentajeAvance`                                                   | Error de validación en `porcentajeAvance`; 400 «porcentajeAvance es obligatorio»                                          |
| CA-12.3  | curl        | Juego con solo partidas antiguas sin avance: `GET …/resumen`                                                                                                                                                                       | `porcentajeAvanceActual: 0`                                                                                               |
| CA-13.1  | test        | `cumplimiento.test.ts` › «CA-13.1 cumplida»                                                                                                                                                                                        | `true`                                                                                                                    |
| CA-13.2  | test        | `cumplimiento.test.ts` › «CA-13.2 horas sí, días no»                                                                                                                                                                               | `false`                                                                                                                   |
| CA-13.3  | test        | `cumplimiento.test.ts` › «CA-13.3 días sí, horas no»                                                                                                                                                                               | `false`                                                                                                                   |
| CA-13.4  | test        | `progreso.test.ts` › «CA-13.4 cumplida por redondeo»                                                                                                                                                                               | 298 min en 4 días → `metaCumplida: true`                                                                                  |
| CA-13.5  | test        | `progreso.test.ts` › «CA-13.5 sin meta no hay indicación»                                                                                                                                                                          | `metaCumplida: null`                                                                                                      |

**Tests adicionales sin criterio de usuario** (DEBE-5):

- `errorHandler.test.ts` › «E11000 → 409», «ApiError conserva su estado» y «error desconocido → 500». Se usa un `response` simulado (`status`, `json`, `locals`).

## 5. Ticket → archivos

| Ticket | Archivos (crear / modificar)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Depende de             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| T-01   | Modificar: `backend/package.json` (devDependency `vitest`, script `"test": "vitest run"`), `backend/tsconfig.json` (`"exclude"` añade `"src/**/*.test.ts"`), `AGENTS.md` (comando de tests). Crear: `backend/src/dominio/humo.test.ts`, que se borra en T-02                                                                                                                                                                                                                                                                                      | —                      |
| T-02   | Crear: `backend/src/dominio/fechas.ts`, `backend/src/dominio/fechas.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | T-01                   |
| T-03   | Crear: `backend/src/dominio/semana.ts`, `backend/src/dominio/semana.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | T-02                   |
| T-04   | Crear: `backend/src/dominio/racha.ts`, `backend/src/dominio/racha.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | T-02                   |
| T-05   | Crear: `backend/src/dominio/hitos.ts`, `backend/src/dominio/hitos.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | T-01                   |
| T-21   | Crear: `backend/src/dominio/cumplimiento.ts`, `backend/src/dominio/cumplimiento.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                          | T-03                   |
| T-06   | Crear: `backend/src/dominio/progreso.ts`, `backend/src/dominio/progreso.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | T-03, T-04, T-05, T-21 |
| T-07   | Crear: `backend/src/modelos/Meta.model.ts`, `backend/src/modelos/Meta.model.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                              | T-01                   |
| T-08   | Modificar: `backend/src/middlewares/errorHandler.ts`, `README.md` (tabla de errores con 409). Crear: `backend/src/middlewares/errorHandler.test.ts`                                                                                                                                                                                                                                                                                                                                                                                               | T-01                   |
| T-09   | Crear: `backend/src/controllers/meta.controller.ts`, `backend/src/services/meta.service.ts`, `backend/src/routes/meta.routes.ts`. Modificar: `backend/src/routes/videojuego.routes.ts` (`GET /:id/metas`), `backend/src/controllers/videojuego.controller.ts` (handler `listarMetas`), `backend/src/app.ts` (`/api/metas`)                                                                                                                                                                                                                        | T-07, T-08, T-05       |
| T-10   | Crear: `backend/src/services/progreso.service.ts`. Modificar: `backend/src/controllers/videojuego.controller.ts` (handler `progresoSemanal`), `backend/src/routes/videojuego.routes.ts` (`GET /:id/progreso-semanal`, antes de `/:id`)                                                                                                                                                                                                                                                                                                            | T-06, T-09             |
| T-11   | Modificar: `backend/src/services/videojuego.service.ts` (`eliminarVideojuego`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | T-07                   |
| T-12   | Modificar: `backend/src/services/videojuego.service.ts` (`actualizarVideojuego`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | T-09                   |
| T-13   | Crear: `docs/pruebas-api-E2.md` (datasets de §7, peticiones, resultado esperado y obtenido)                                                                                                                                                                                                                                                                                                                                                                                                                                                       | T-10, T-11, T-12       |
| T-19   | Crear: `backend/src/modelos/Partida.model.test.ts` (CA-12.2). Modificar: `backend/src/services/videojuego.service.ts` (`obtenerResumen`), `backend/src/controllers/partida.controller.ts` (avance obligatorio), `backend/src/modelos/Partida.model.ts` (`required` en `porcentajeAvance` para documentos nuevos), `frontend/src/paginas/PartidaForm.tsx`, `README.md` (fórmula del avance)                                                                                                                                                        | T-01                   |
| T-20   | Crear: `backend/src/dominio/partida.ts`, `backend/src/dominio/partida.test.ts`. Modificar: `backend/src/controllers/partida.controller.ts` (`fechaConHoraYZona`), `backend/src/services/partida.service.ts` (`validarPartidaNueva(input, new Date())`), `backend/src/modelos/Partida.model.ts` (`min: 5`, `max: 1440`), `frontend/src/paginas/PartidaForm.tsx` (envía la fecha con `-05:00` explícito, D-T09; `min` y `max` de la duración), `README.md` (tabla de validaciones: fecha con hora y zona, no posterior a hoy, duración de 5 a 1440) | T-01, T-02             |

## 6. Casos de prueba de datos (T-13)

La API no tiene un parámetro `?ahora=` (NO-DEBE-6), así que los datos se crean **relativos a hoy (H)** en hora de Ecuador. Entre paréntesis va el valor concreto si las pruebas se ejecutan el **domingo 15 de noviembre de 2026**. Las peticiones se envían con `curl.exe --data-binary @archivo.json` (README §8, incidencia de PowerShell).

| Dataset | Juego                                                                     | Datos                                                                                                                                                                                                                                                                                                                                                       | Uso                                           |
| ------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **A**   | «Celeste», `jugando`, **sin partidas**                                    | Sin meta al principio; después una meta de 5 h / 3 días con un hito de 25 %                                                                                                                                                                                                                                                                                 | CA-07.2, CA-07.3; progreso sin partidas       |
| **B**   | «Hades», `jugando`, **8 partidas en 7 días distintos con una racha rota** | H−9 (6 nov), H−8 (7), H−7 (8), H−6 (lun 9): 60 min cada una → racha de 4. Sin partidas en H−5 (10) ni en H−4 (11): la racha se rompe. H−3 (12), H−2 (13), H−1 (14): 60 min cada una. Una segunda partida el H−1 a las 23:30 (`"2026-11-14T23:30:00-05:00"`, 30 min, avance 55). Avances crecientes hasta 55. Meta de 5 h / 4 días con hitos de 25, 50 y 100 | Progreso con racha rota y partida a las 23:30 |
| **C**   | «Hollow Knight», `abandonado`                                             | Sin meta                                                                                                                                                                                                                                                                                                                                                    | 409 por estado (CA-01.7, CA-03.6)             |
| **D**   | «Hades II»                                                                | Una partida de H−5 con avance 60 y una antigua de H−3 **sin avance**, insertada antes de T-19 o directamente en Atlas                                                                                                                                                                                                                                       | CA-12.1                                       |

**Resultado esperado para B**, consultado el domingo 15. La semana va del 9 al 15, con partidas el 9, 12, 13, 14 y 14 a las 23:30:

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
  "metaCumplida": false
}
```

Si se ejecuta otro día, `horasSemana`, `diasJugadosSemana` y `porcentajeHoras` dependen de cuántas de esas fechas caen en la semana actual. `rachaActual` es 3 y `mejorRacha` es 4 siempre que se consulte en el día H sin una partida nueva.

**Errores:**

| Caso                      | Petición                                                                     | Esperado                                                            |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 400 · id inválido         | `GET /api/videojuegos/abc/progreso-semanal`                                  | 400 «El identificador de videojuego no tiene un formato válido»     |
| 400 · rango               | `POST /api/metas` `{ videojuego: A, horasSemanales: 4.5, diasPorSemana: 3 }` | 400, mensaje del esquema                                            |
| 404 · juego inexistente   | `GET /api/videojuegos/000000000000000000000000/progreso-semanal`             | 404 «Videojuego no encontrado»                                      |
| 404 · meta inexistente    | `GET /api/metas/000000000000000000000000`                                    | 404 «Meta no encontrada»                                            |
| 409 · segunda meta activa | `POST /api/metas` para B, que ya tiene meta activa                           | 409 «Este videojuego ya tiene una meta activa»                      |
| 409 · juego abandonado    | `POST /api/metas` para C                                                     | 409 «El videojuego está abandonado: no puede tener una meta activa» |

## 7. Puntos abiertos

Ninguno. Decisiones de la estudiante que cierran los puntos pendientes del borrador:

| Tema                                      | Decisión                                                                 | Dónde queda                              |
| ----------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| `requestId` en el progreso                | Se incluye en el nivel superior, como en el resto de la API              | §3.3                                     |
| Desactivar una meta ya inactiva           | 409 «La meta ya está inactiva»; el frontend vuelve a consultar el estado | §3.2                                     |
| Descripción de un hito                    | Obligatoria, con trim, de 1 a 100 caracteres                             | PRD R-16 y S-06; backlog CA-01.8; §3.1   |
| Mensajes de validación en bruto           | Se mantienen como están                                                  | Backlog, «Deuda técnica»: D-05 (parcial) |
| Partidas antiguas sin avance y `required` | Solo se documenta: sin edición de partidas no hay impacto                | PRD S-07, ligado a P-01 y D-04           |
