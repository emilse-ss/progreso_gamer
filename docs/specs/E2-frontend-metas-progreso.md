# Spec · Frontend de metas y progreso semanal

- **Épica:** E2 · Metas y rachas
- **Historias:** HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-10, HU-13
- **Tickets:** T-14, T-15, T-16, T-17, T-18
- **Estado:** borrador
- **Fuentes:** `docs/prd/PRD.md`, `docs/backlog/E2-metas-y-rachas.md`, `docs/specs/E2-backend-metas-progreso.md` (contrato de la API) y `DESIGN.md`. Decisiones técnicas D-T14 y D-T15 (fase 5).

## 1. Objetivo y alcance

En el detalle de cada videojuego, la jugadora ve el progreso de la **semana actual** y gestiona su meta:

- Ve las horas frente a la meta, los días jugados frente al objetivo, si la meta está cumplida, la racha actual, la mejor racha y los hitos con su estado.
- Crea y edita la meta, con hasta 5 hitos.
- Desactiva la meta (con confirmación) y la reactiva desde la lista de metas inactivas.
- Si no hay meta activa, se la invita a crear una.

El progreso se vuelve a consultar cuando cambian las partidas.

| Tickets                                                                                                                                                                                 | Reglas que la interfaz muestra o respeta                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| T-14 (servicio de metas y tipos), T-15 (sección de progreso), T-16 (formulario de meta), T-17 (desactivar, lista de inactivas y reactivar), T-18 (refresco y fechas en hora de Ecuador) | R-08 (tope visual), R-09, R-11, R-12, R-13, R-14, R-15, R-16, R-17, R-19, R-20 (se refleja), R-21 (se refleja) |

**El cálculo es del backend.** Semana, días, horas, porcentaje, racha, hitos y cumplimiento (R-01 a R-10, R-17, R-18, R-23) los calcula la API (spec de backend); la interfaz **solo muestra** lo que recibe. Los cambios de `PartidaForm.tsx` de T-19 y T-20 (avance obligatorio, fecha con `-05:00`, duración de 5 a 1440 minutos) están especificados en la spec de backend, porque forman parte de esas deudas.

## 2. Reglas

### DEBE

- **DEBE-1:** los estilos nuevos usan **solo** variables de `frontend/src/estilos/tema.css` (`var(--…)`), siguiendo `DESIGN.md`. Las clases nuevas van en `components/ui/componentes.css`, con el prefijo de su bloque (`progress-week…`, `meta-form…`, `metas-inactivas…`).
- **DEBE-2:** la interfaz se construye con los componentes de `components/ui/`: `BarraProgreso`, `Boton`, `CardItem`, `AlertMessage`, `Skeleton`, `ModalConfirmacion`, `EtiquetaSeccion`, `Insignia` e `iconos`.
- **DEBE-3:** toda llamada HTTP pasa por `api/metasApi.ts` o `api/videojuegosApi.ts`, que usan `httpClient` (`requestJson`, `jsonRequest`).
- **DEBE-4:** los errores del cliente HTTP (`ApiError` con `message`, `status` y `requestId`) se muestran con `AlertMessage variant="error"`, usando el `message` que devuelve la API. Si `status === 0` (no hay conexión), se muestra el mensaje de conexión del cliente y la acción «Reintentar».
- **DEBE-5:** la sección de progreso cubre cuatro estados: **cargando**, **error** (con «Reintentar»), **vacío** (sin partidas esta semana) y **sin meta activa** (con la invitación «Crear meta»). Ninguno muestra una pantalla en blanco.
- **DEBE-6:** **el refresco cubre registrar y eliminar. La edición queda diferida (D-04); cuando exista, usará el mismo mecanismo.** El mecanismo es genérico: una clave de recarga `versionPartidas` en el detalle y una función `alCambiarPartidas()` que la incrementa. Cualquier cambio en las partidas la dispara, y esa clave es dependencia de las consultas del resumen, las partidas, el progreso y las metas (§3.6).
- **DEBE-7:** cualquier cambio en las metas (crear, editar, desactivar, reactivar o recibir un 409) vuelve a consultar las metas y el progreso del juego. La clave para eso es `versionMetas`.
- **DEBE-8:** las barras usan `BarraProgreso`, que ya tiene `role="progressbar"` y `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y `aria-label`. Se añade la prop opcional `textoValor`, que se expone como `aria-valuetext` y se muestra visible («3.5 h de 5 h», «3 de 4 días»).
- **DEBE-9:** el estado nunca se comunica solo con color:
  - Cada hito muestra el texto «Alcanzado» o «Pendiente», con su icono `aria-hidden`.
  - La meta cumplida se indica con un texto.
  - Las metas inactivas llevan el texto «Inactiva».
- **DEBE-10:** cada campo del formulario tiene su `<label>`. Los campos de cada hito llevan una etiqueta numerada («Descripción del hito 2», «Objetivo del hito 2 (%)»). El botón «Quitar» lleva un `aria-label` con el número del hito. Al agregar un hito, el foco pasa a su descripción.
- **DEBE-11:** el foco se mantiene visible (`:focus-visible` del tema). El modal devuelve el foco al botón que lo abrió (ya lo hace `ModalConfirmacion`). Los controles miden al menos `--alto-tactil`.
- **DEBE-12:** las fechas se muestran con `timeZone: 'America/Guayaquil'` y el formato `es-EC`, a través de un único helper `utils/formatoFecha.ts` (D-02, T-18). Los días `YYYY-MM-DD` de la API (`semana.inicio` y `semana.fin`) se formatean **sin** convertirlos a un instante local, para que no se desplacen al día anterior.
- **DEBE-13:** los textos siguen el tono de `DESIGN.md`: tuteo, verbos en infinitivo en los botones y, en los errores, primero qué falló y luego qué hacer.
- **DEBE-14:** si el videojuego está `completado` o `abandonado`, la sección no ofrece «Crear meta» ni «Reactivar». En su lugar muestra un `AlertMessage info` con «Este videojuego está completado: no puede tener una meta activa» (R-19, R-20). Si la API responde 409, se muestra su mensaje.

### NO DEBE

- **NO-DEBE-1:** ningún componente ni página llama a `fetch` directamente.
- **NO-DEBE-2:** la interfaz no recalcula el progreso: no calcula horas, porcentaje de horas, días jugados, rachas, estado de los hitos ni «meta cumplida». Lo único que se deriva es el **ancho visual** de la barra de días, `min(100, round(diasJugadosSemana / diasPorSemana × 100))`, a partir de dos valores de la API.
- **NO-DEBE-3:** no se usan colores ni medidas escritos a mano (`#hex`, `rgb()`, `px` o `rem` sueltos), ni `style={{…}}` salvo el ancho dinámico que ya usa `BarraProgreso`.
- **NO-DEBE-4:** no se usan componentes, grid, utilidades ni JavaScript de Bootstrap fuera de lo que autoriza `DESIGN.md` (D-13), ni `window.confirm` o `window.alert`.
- **NO-DEBE-5:** no se añaden dependencias de npm ni librerías de UI o de iconos.
- **NO-DEBE-6:** no se ofrece borrar metas (R-15) ni editar una meta inactiva (R-14). Al editar, el videojuego de la meta no se puede cambiar.
- **NO-DEBE-7:** el formulario no repite las reglas de negocio de la API (por ejemplo, la de objetivos repetidos): solo usa restricciones HTML (`required`, `min`, `max`, `step="1"`, `maxLength={100}`) y muestra el mensaje de la API cuando responde 400 o 409.

## 3. Contrato

### 3.1 Tipos (`frontend/src/types.ts`)

```ts
export interface Hito {
  descripcion: string;
  porcentajeObjetivo: number;
}
export interface HitoProgreso extends Hito {
  alcanzado: boolean;
}

export interface Meta {
  _id: string;
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: Hito[]; // ya vienen ordenados de menor a mayor
  createdAt: string;
  updatedAt: string;
}

export interface MetaInput {
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  hitos: Hito[];
}
export type MetaUpdateInput = Partial<
  Pick<MetaInput, 'horasSemanales' | 'diasPorSemana' | 'hitos'>
>;

export interface MetaResponse {
  meta: Meta;
  requestId: string;
}
export interface MetasListResponse {
  total: number;
  metas: Meta[];
  requestId: string;
}

export interface ProgresoSemanal {
  semana: { inicio: string; fin: string }; // "YYYY-MM-DD"
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoProgreso[];
  metaCumplida: boolean | null;
}
export interface ProgresoSemanalResponse extends ProgresoSemanal {
  requestId: string;
}
```

### 3.2 `frontend/src/api/metasApi.ts` (nuevo)

| Función                                              | Petición                                                     | Devuelve                              |
| ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| `crearMeta(input: MetaInput)`                        | `POST /api/metas`, con `jsonRequest('POST', input)`          | `Promise<Meta>` (`response.meta`)     |
| `obtenerMeta(id: string)`                            | `GET /api/metas/:id`                                         | `Promise<Meta>`                       |
| `listarMetasDeVideojuego(videojuegoId: string)`      | `GET /api/videojuegos/:id/metas`                             | `Promise<Meta[]>` (la activa primero) |
| `actualizarMeta(id: string, input: MetaUpdateInput)` | `PATCH /api/metas/:id`                                       | `Promise<Meta>`                       |
| `desactivarMeta(id: string)`                         | `PATCH /api/metas/:id/desactivar`, con `{ method: 'PATCH' }` | `Promise<Meta>`                       |
| `reactivarMeta(id: string)`                          | `PATCH /api/metas/:id/reactivar`                             | `Promise<Meta>`                       |

Los ids se pasan siempre por `encodeURIComponent`, como en `videojuegosApi.ts`.

### 3.3 Progreso semanal (`frontend/src/api/videojuegosApi.ts`)

| Función                                        | Petición                                    | Devuelve                           |
| ---------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| `obtenerProgresoSemanal(videojuegoId: string)` | `GET /api/videojuegos/:id/progreso-semanal` | `Promise<ProgresoSemanalResponse>` |

Va junto a `obtenerResumenVideojuego`, porque también es una lectura que cuelga del videojuego.

### 3.4 Manejo de errores

`httpClient` lanza un `ApiError` con `message` (el campo `error` de la API o un texto genérico), `status` y `requestId`.

| Situación                                                                                 | `status` | Qué muestra la interfaz                                                                                                          |
| ----------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| No hay conexión                                                                           | 0        | `AlertMessage error` con el mensaje del cliente y «Reintentar»                                                                   |
| Validación (rangos, objetivos repetidos, descripción)                                     | 400      | En el formulario: `AlertMessage error` encima de las acciones, con el mensaje de la API. Los datos escritos se conservan         |
| Meta o juego inexistente                                                                  | 404      | Página del formulario: «No encontramos esta meta.» con el botón «Volver al videojuego». En la sección: el error con «Reintentar» |
| Conflicto (segunda meta activa, juego completado o abandonado, meta inactiva o ya activa) | 409      | El mensaje de la API en `AlertMessage error`, y se vuelven a consultar las metas y el progreso (DEBE-7)                          |
| Error del servidor                                                                        | 500      | «No se pudo completar la acción. Inténtalo de nuevo.» con «Reintentar»                                                           |

### 3.5 Pantallas y componentes

#### a) Sección de progreso: `components/SeccionProgreso.tsx` (T-15)

**Props:**

```ts
{
  videojuegoId: string;
  estadoVideojuego?: EstadoVideojuego;
  versionPartidas: number;
  versionMetas: number;
  alCambiarMetas: () => void;
}
```

**Ubicación:** en `DetalleVideojuegoPage`, entre «Resumen» y «Partidas». Es una `<section aria-labelledby>` con `EtiquetaSeccion` «Esta semana» y el rango de la semana («9 al 15 de nov.»).

**Datos:** `obtenerProgresoSemanal` y `listarMetasDeVideojuego` se piden en paralelo. Las dos dependen de `videojuegoId`, `versionPartidas`, `versionMetas` y un contador de reintentos.

| Estado              | Cuándo                                          | Qué se ve                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cargando**        | Mientras llegan las respuestas                  | `Skeleton variante="resumen"`                                                                                                                                                                                                                                                                                                                                                        |
| **Error**           | Falla alguna de las dos peticiones              | `AlertMessage error` «No se pudo cargar el progreso de la semana.» con `Boton` «Reintentar»                                                                                                                                                                                                                                                                                          |
| **Sin meta activa** | `meta === null`                                 | `AlertMessage empty`: «Este videojuego no tiene una meta activa. Fija una para seguir tu semana.» con `Boton` primario «Crear meta», que lleva a `/videojuegos/:id/meta/nueva`. Debajo, tarjetas `summary-stat` con horas, días jugados, racha actual y mejor racha, **sin** barras ni porcentaje (R-11). Si el juego está completado o abandonado, se ve DEBE-14 en lugar del botón |
| **Vacío**           | `horasSemana === 0` y `diasJugadosSemana === 0` | Además de lo que corresponda (con o sin meta): `AlertMessage empty` «Aún no juegas esta semana. Registra una partida para empezar.»                                                                                                                                                                                                                                                  |
| **Con meta**        | `meta !== null`                                 | Ver abajo                                                                                                                                                                                                                                                                                                                                                                            |

**Contenido con meta:**

1. **Horas:** `BarraProgreso` con `valor={porcentajeHoras}`, `etiqueta="Horas de la semana"` y `textoValor="3.5 h de 5 h"`. El tope visual es 100 (R-08), y el porcentaje lo da la API.
2. **Días:** `BarraProgreso` con `etiqueta="Días jugados"`, `textoValor="3 de 4 días"` y el ancho de NO-DEBE-2.
3. **Meta cumplida (R-09):** si `metaCumplida === true`, `AlertMessage success` «¡Meta de la semana cumplida!». Si es `false`, un texto neutro «Meta de la semana aún no cumplida». Nunca se indica solo con color.
4. **Rachas:** dos `summary-stat`, «Racha actual» y «Mejor racha», con la cifra y la unidad («4 días»; «1 día» en singular).
5. **Hitos (R-16, R-17):** una lista `<ul>` en el orden de la API. Cada elemento lleva la descripción, «objetivo 50 %» y el estado «Alcanzado» (con `IconoTrofeo`) o «Pendiente». Sin hitos: «Esta meta no tiene hitos.»
6. **Acciones:** `Boton` neutro «Editar meta», que lleva a `/metas/:metaId/editar`, y `Boton` peligro «Desactivar meta», que abre `ModalConfirmacion`.
7. **Metas inactivas:** `components/MetasInactivas.tsx` (T-17), ver d).

#### b) Formulario de meta: `paginas/MetaForm.tsx` y `paginas/MetaFormPage.tsx` (T-16)

**Rutas** en `App.tsx`:

- `/videojuegos/:id/meta/nueva`: crear.
- `/metas/:metaId/editar`: editar. Carga la meta con `obtenerMeta`; si está inactiva, muestra «Solo se puede editar la meta activa.» y no muestra el formulario (CA-02.2).

**Campos:**

- «Horas por semana»: `type="number"`, `min=1`, `max=100`, `step=1`, `required`.
- «Días por semana»: `min=1`, `max=7`, `step=1`, `required`.
- **Hitos:** una fila por hito, con «Descripción del hito N» (`maxLength=100`, `required`) y «Objetivo del hito N (%)» (`min=1`, `max=100`, `step=1`, `required`), más «Quitar».
  - `Boton` secundario «Agregar hito». Se desactiva cuando hay 5, con el texto de ayuda «Máximo 5 hitos» (R-16).
- **Videojuego:** al editar se muestra como texto de solo lectura y **no se envía** (R-14).

**Envío:**

- Crear llama a `crearMeta`; editar llama a `actualizarMeta` con horas, días e hitos.
- Mientras se envía, el botón «Guardar» se desactiva y muestra «Guardando…».
- Si todo va bien, vuelve a `/videojuegos/:id`, donde el detalle se monta de nuevo y consulta todo.
- Si hay error: §3.4. Los valores escritos se conservan.

**Botones:** `Boton` primario «Guardar meta», el único primario de la vista, y `Boton` neutro «Cancelar», que vuelve al detalle.

#### c) Desactivar con confirmación (T-17)

- El modal es `ModalConfirmacion` con `titulo="¿Desactivar la meta de Hades?"`, el texto «La meta pasará a tus metas anteriores. Podrás reactivarla cuando quieras.» y `etiquetaConfirmar="Desactivar"`.
- «Cancelar» cierra sin llamar a la API (CA-03.2).
- Confirmar llama a `desactivarMeta` y después a `alCambiarMetas()`.
- Un 409 («La meta ya está inactiva») muestra el mensaje y también llama a `alCambiarMetas()`.

#### d) Metas inactivas: `components/MetasInactivas.tsx` (T-17)

- **Props:** `metas: Meta[]` (las inactivas), `puedeReactivar: boolean` y `alReactivar: (id: string) => Promise<void>`.
- **Lista** con el título «Metas anteriores». Cada meta es un `CardItem`:
  - Título: «5 h · 3 días por semana».
  - Detalles: «2 hitos · desactivada el 13 nov.» (de `updatedAt`, formateado en hora de Ecuador), con `Insignia` «Inactiva».
  - Acción: `Boton` secundario pequeño «Reactivar».
- **Reactivar:**
  - El botón no aparece si hay una meta activa o si el juego está completado o abandonado (`puedeReactivar === false`).
  - Al pulsarlo llama a `reactivarMeta`. Si funciona, llama a `alCambiarMetas()`; si responde 409, muestra el mensaje y también llama a `alCambiarMetas()`.
- **Sin metas inactivas:** la lista no se muestra.
- **Borrar:** no hay ninguna acción de borrar (R-15).

#### e) Detalle: refresco y partidas (T-18)

En `DetalleVideojuegoPage`:

```ts
const [versionPartidas, setVersionPartidas] = useState(0);
const alCambiarPartidas = () => setVersionPartidas((v) => v + 1); // registrar, eliminar y, cuando exista, editar
const [versionMetas, setVersionMetas] = useState(0);
const alCambiarMetas = () => setVersionMetas((v) => v + 1);
```

- **Las consultas del resumen y de las partidas** dependen de `versionPartidas`, además de los contadores de reintento que ya existen. La sección de progreso recibe las dos versiones.
- **Eliminar partida (nuevo en el detalle):**
  - Cada partida de la lista del detalle tiene un `Boton` peligro pequeño «Eliminar», con un `aria-label` que incluye la fecha.
  - Abre `ModalConfirmacion` («¿Eliminar la partida del 14 nov. a las 23:30?»).
  - Al confirmar llama a `eliminarPartida` (`partidasApi`) y luego a `alCambiarPartidas()` (CA-08.2).
- **Registrar partida:**
  - Se hace en `PartidaFormPage`, que al terminar vuelve a `/videojuegos/:id`.
  - El detalle se monta de nuevo y todas sus consultas se repiten, con `versionPartidas = 0` (CA-08.1). Se documenta como el mecanismo de refresco de esa navegación.
  - Si en el futuro el registro se hace dentro del detalle, llamará a `alCambiarPartidas()`.
- **Fechas:** `formatDate` de `DetalleVideojuegoPage.tsx` y `ListaPartidasPage.tsx` se sustituye por `formatearFechaHora` de `utils/formatoFecha.ts` (`timeZone: 'America/Guayaquil'`). Para los días `YYYY-MM-DD` se añade `formatearDia`, que usa `timeZone: 'UTC'` sobre `Date.UTC(...)` para no desplazar el día.

## 4. Criterio → verificación

**Tipos de verificación:**

- **manual:** pasos en la interfaz con la API local (`npm run dev` en `backend/` y `frontend/`) y los datasets de la spec de backend (§6).
- **build:** `npm run build` en `frontend/` sin errores.
- **backend:** el cálculo se verifica en la spec de backend; aquí solo se comprueba que la interfaz muestra el valor que devuelve la API.

| Criterio          | Tipo             | Pasos                                                                                                       | Resultado esperado                                                                                                                   |
| ----------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CA-01.1           | manual           | Detalle de «Celeste» sin meta → «Crear meta» → 5 h y 3 días → «Guardar meta»                                | Vuelve al detalle; se ven las barras «0 h de 5 h» y «0 de 3 días»                                                                    |
| CA-01.2           | manual           | En el formulario, escribir 4.5 h (el navegador lo marca por `step`). Forzar 0 o 120 desde DevTools y enviar | El navegador impide el envío o la API responde 400 y su mensaje se ve encima de las acciones; los datos se conservan                 |
| CA-01.3           | manual           | Crear con los hitos 50, 25 y 100                                                                            | En la sección, los hitos se ven como 25, 50 y 100                                                                                    |
| CA-01.4           | manual           | Intentar agregar un sexto hito; crear con dos hitos de 50                                                   | «Agregar hito» se desactiva al llegar a 5, con «Máximo 5 hitos»; 400 «No puede haber dos hitos con el mismo objetivo (50 %)» visible |
| CA-01.5           | manual           | Crear una meta sin hitos                                                                                    | Se crea; la sección dice «Esta meta no tiene hitos.»                                                                                 |
| CA-01.6           | manual           | Con una meta activa, ir a `/videojuegos/:id/meta/nueva` por URL y enviar                                    | Se ve el 409 «Este videojuego ya tiene una meta activa»                                                                              |
| CA-01.7           | manual           | Detalle de un juego abandonado                                                                              | No hay «Crear meta»; se ve el aviso de DEBE-14. Forzando la ruta, se ve el mensaje del 409                                           |
| CA-01.8           | manual           | Descripción vacía o de 101 caracteres; descripción « Mitad »                                                | El navegador o la API la rechaza con el mensaje visible; la tercera se guarda y se ve «Mitad»                                        |
| CA-02.1           | manual           | «Editar meta» → 8 h, 4 días, agregar un hito de 25 → guardar                                                | El detalle muestra «de 8 h» y «de 4 días», con los hitos 25 y 50                                                                     |
| CA-02.2           | manual           | En «Metas anteriores» no hay «Editar»; abrir `/metas/:idInactiva/editar`                                    | «Solo se puede editar la meta activa.» sin formulario                                                                                |
| CA-02.3           | manual           | Abrir la edición                                                                                            | El videojuego aparece como texto de solo lectura; en la pestaña Red, el `PATCH` no lleva `videojuego`                                |
| CA-02.4           | backend          | Después de editar de 5 a 10 h con 4 h jugadas                                                               | La barra muestra «4 h de 10 h» y 40 %                                                                                                |
| CA-02.5           | manual           | Editar con dos hitos de 50                                                                                  | 400 visible; al cancelar, la meta sigue igual en el detalle                                                                          |
| CA-03.1           | manual           | «Desactivar meta» → «Desactivar»                                                                            | El modal se cierra; aparece el estado «sin meta activa» y la meta en «Metas anteriores»                                              |
| CA-03.2           | manual           | «Desactivar meta» → «Cancelar» (o Escape)                                                                   | No hay petición en la pestaña Red; la meta sigue activa; el foco vuelve al botón                                                     |
| CA-03.3           | manual           | Juego con 2 metas inactivas                                                                                 | «Metas anteriores» muestra 2 tarjetas con horas, días, número de hitos e «Inactiva»; no hay «Borrar»                                 |
| CA-03.4           | manual           | Sin meta activa → «Reactivar» en una inactiva                                                               | Pasa a ser la meta activa y sale de la lista                                                                                         |
| CA-03.5           | manual           | Con meta activa                                                                                             | No aparece «Reactivar». Forzando la petición desde la consola, el 409 se muestra y la lista se vuelve a consultar                    |
| CA-03.6           | manual           | Juego abandonado con una meta inactiva                                                                      | No aparece «Reactivar»; se ve el aviso de DEBE-14                                                                                    |
| CA-04.1 a CA-04.9 | backend + manual | Dataset B de la spec de backend, consultado el domingo 15                                                   | La sección muestra «9 al 15 de nov.», «4.5 h de 5 h» (90 %) y «4 de 4 días», igual que la respuesta de la API en la pestaña Red      |
| CA-05.1 a CA-05.7 | backend + manual | Dataset B                                                                                                   | «Racha actual: 3 días» y «Mejor racha: 4 días», iguales a la API                                                                     |
| CA-06.1 a CA-06.4 | backend + manual | Dataset B con hitos de 25, 50 y 100                                                                         | 25 y 50 con «Alcanzado» y el icono; 100 con «Pendiente»; en ese orden                                                                |
| CA-07.1           | manual           | Juego con partidas y sin meta                                                                               | Horas, días y rachas en tarjetas, sin barras ni porcentaje; invitación «Crear meta»                                                  |
| CA-07.2           | manual           | Dataset A con meta y sin partidas                                                                           | Barras «0 h de 5 h» y «0 de 3 días»; aviso «Aún no juegas esta semana…»; hito «Pendiente»                                            |
| CA-07.3           | manual           | Juego recién creado                                                                                         | Valores en 0, invitación a crear la meta y ningún error                                                                              |
| CA-08.1           | manual           | Detalle con 2.0 h → «Registrar partida» de 60 min hoy → guardar                                             | Al volver al detalle: 3.0 h, un día más y la racha actualizada, sin recargar el navegador                                            |
| CA-08.2           | manual           | En el detalle, «Eliminar» una partida de esta semana → confirmar                                            | La partida desaparece; el resumen y el progreso se actualizan al momento (una nueva petición de progreso en la pestaña Red)          |
| CA-09.1 / CA-09.2 | manual           | Editar el juego a «Completado» o «Abandonado» y volver al detalle                                           | Sin meta activa; la meta aparece en «Metas anteriores»; aviso de DEBE-14                                                             |
| CA-09.3           | manual           | Editar a «Pausado»                                                                                          | La meta sigue activa                                                                                                                 |
| CA-09.4           | manual           | Volver a «Jugando»                                                                                          | Sigue sin meta activa; aparece «Reactivar»                                                                                           |
| CA-10.1 / CA-10.2 | backend + manual | Eliminar el juego desde el detalle                                                                          | Vuelve a la lista; abrir por URL una meta de ese juego en edición muestra «No encontramos esta meta.»                                |
| CA-11.1 a CA-11.5 | backend          | Spec de backend (T-20); el formulario de partida muestra el mensaje de la API                               | —                                                                                                                                    |
| CA-12.1 a CA-12.3 | backend          | Spec de backend (T-19)                                                                                      | —                                                                                                                                    |
| CA-13.1 / CA-13.4 | backend + manual | Semana cumplida                                                                                             | «¡Meta de la semana cumplida!» en texto                                                                                              |
| CA-13.2 / CA-13.3 | backend + manual | Horas sí y días no, o al revés                                                                              | «Meta de la semana aún no cumplida»                                                                                                  |
| CA-13.5           | manual           | Sin meta                                                                                                    | No aparece ninguna indicación de cumplimiento                                                                                        |
| Todas             | build            | `npm run build` en `frontend/`                                                                              | Sin errores de TypeScript ni de Vite                                                                                                 |

## 5. Ticket → archivos

| Ticket | Archivos (crear / modificar)                                                                                                                                                                                                                                                                                                  | Depende de     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| T-14   | Crear: `frontend/src/api/metasApi.ts`. Modificar: `frontend/src/api/videojuegosApi.ts` (`obtenerProgresoSemanal`), `frontend/src/types.ts` (§3.1)                                                                                                                                                                             | T-10 (backend) |
| T-15   | Crear: `frontend/src/components/SeccionProgreso.tsx`. Modificar: `frontend/src/components/ui/BarraProgreso.tsx` (prop `textoValor`), `frontend/src/components/ui/componentes.css` (clases `progress-week…`), `frontend/src/paginas/DetalleVideojuegoPage.tsx` (inserta la sección y define `versionMetas` y `alCambiarMetas`) | T-14           |
| T-16   | Crear: `frontend/src/paginas/MetaForm.tsx`, `frontend/src/paginas/MetaFormPage.tsx`. Modificar: `frontend/src/App.tsx` (dos rutas), `frontend/src/components/ui/componentes.css` (clases `meta-form…`)                                                                                                                        | T-14           |
| T-17   | Crear: `frontend/src/components/MetasInactivas.tsx`. Modificar: `frontend/src/components/SeccionProgreso.tsx` (modal de desactivar y lista), `frontend/src/components/ui/componentes.css` (clases `metas-inactivas…`)                                                                                                         | T-15           |
| T-18   | Crear: `frontend/src/utils/formatoFecha.ts`. Modificar: `frontend/src/paginas/DetalleVideojuegoPage.tsx` (`versionPartidas`, `alCambiarPartidas`, eliminar partida con modal), `frontend/src/paginas/ListaPartidasPage.tsx` (usa el helper de fechas)                                                                         | T-15           |

## 6. Checklist de revisión de diseño (fase 7)

Se rellena por cada pantalla tocada: la sección de progreso, el formulario de meta, la lista de metas inactivas, los modales y la lista de partidas del detalle. Cada punto es ✅ / ❌, con una nota.

| #   | Punto (de `DESIGN.md`)                                                                                                     | Cómo se comprueba                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Ningún color ni medida escrito a mano: solo `var(--…)`                                                                     | Buscar `#[0-9a-f]{3,6}`, `rgb(`, `[0-9]+px` y `rem` en los archivos nuevos o modificados |
| 2   | Ningún `style={{…}}` salvo el ancho de `BarraProgreso`                                                                     | Buscar `style={{`                                                                        |
| 3   | Solo los componentes `ui/` y las clases propias; sin `btn`, `card`, `alert`, `row`, `col-*`, `m*-*` ni `p*-*` de Bootstrap | Buscar en el JSX nuevo                                                                   |
| 4   | Tipografía: títulos en `--fuente-titulo`, el resto en `--fuente-texto`; tamaños de la escala `--texto-*`                   | Revisión del CSS nuevo                                                                   |
| 5   | Espaciado con `--esp-*`; radios `--radio-m` y `--radio-l`; `--borde-grueso` en los bloques con fondo                       | Revisión del CSS nuevo                                                                   |
| 6   | Un solo botón primario por vista («Crear meta» o «Guardar meta»)                                                           | Revisión visual                                                                          |
| 7   | Pares de contraste permitidos; nunca texto negro sobre rojo                                                                | Revisión visual de los botones de peligro y las insignias                                |
| 8   | Estados de los hitos y de la meta con texto, no solo con color                                                             | Revisión visual con un filtro de escala de grises                                        |
| 9   | Foco visible en todos los controles; orden de tabulación lógico; el modal atrapa el foco y lo devuelve                     | Recorrido completo con teclado                                                           |
| 10  | Controles de al menos `--alto-tactil` (44 px)                                                                              | DevTools                                                                                 |
| 11  | `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` y `aria-valuetext`                | Inspector de accesibilidad                                                               |
| 12  | Cada `input` con su `<label>`; los hitos numerados; «Quitar» con `aria-label`                                              | Inspector de accesibilidad                                                               |
| 13  | Iconos decorativos con `aria-hidden="true"`                                                                                | Inspector                                                                                |
| 14  | Se respeta `prefers-reduced-motion` (sin transiciones nuevas que lo ignoren)                                               | DevTools › Rendering                                                                     |
| 15  | Cuatro estados: carga (`Skeleton`), error con «Reintentar», vacío y sin meta activa                                        | Simular errores y conexión lenta en DevTools › Red                                       |
| 16  | Tono: tuteo, botones en infinitivo, errores que dicen qué falló y qué hacer, sin mensajes en inglés                        | Lectura de todos los textos nuevos                                                       |
| 17  | Fechas en `es-EC` y hora de Ecuador; la semana no se desplaza un día                                                       | Cambiar la zona del sistema a otra (por ejemplo UTC+1) y comprobar «9 al 15 de nov.»     |
| 18  | Sin `window.confirm` ni `window.alert`; confirmaciones con `ModalConfirmacion`                                             | Buscar en el código                                                                      |
| 19  | Mobile-first: se ve bien a 360 px y desde `48rem`; ancho máximo `--ancho-contenido`                                        | DevTools, vista responsive                                                               |
| 20  | Sin dependencias nuevas en `frontend/package.json`                                                                         | `git diff frontend/package.json`                                                         |

## 7. Puntos abiertos

Ninguno. La edición de partidas queda fuera de alcance (D-04, P-01); cuando exista, usará `alCambiarPartidas()` (DEBE-6).
