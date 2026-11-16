# Revisión del frontend de E2 (fase 7)

Spec: [`E2-frontend-metas-progreso.md`](../specs/E2-frontend-metas-progreso.md). Tickets T-14 a T-18, commits `8d47ff0` a `c6be901`.

## 1. Diferencias con la spec (aprobadas por la estudiante)

| #   | Spec                                                                       | Implementación                                                                                                                                                                | Ticket | Estado   |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| 1   | `utils/formatoFecha.ts` se crea en T-18 (§5)                               | Se creó en T-15, porque la sección ya mostraba el rango de la semana; T-17 y T-18 lo amplían (`formatearFechaCorta`, `formatearFechaHora`)                                    | T-15   | Aprobada |
| 2   | T-17 modifica `SeccionProgreso.tsx` y `componentes.css`                    | También toca `DetalleVideojuegoPage.tsx` (una línea: pasa `nombreVideojuego` para el título del modal) y `formatoFecha.ts`                                                    | T-17   | Aprobada |
| 3   | T-18 no menciona el modal de eliminar videojuego                           | Su texto dice ahora «También se borrarán todas sus partidas y sus metas», para reflejar la cascada (R-21)                                                                     | T-18   | Aprobada |
| 4   | Registrar y eliminar usan el mecanismo genérico `versionPartidas` (DEBE-6) | Eliminar desde el detalle llama a `alCambiarPartidas()`. Registrar refresca porque `PartidaFormPage` navega al detalle y este se monta de nuevo (documentado en la spec §3.6) | T-18   | Conforme |

## 2. Checklist de diseño (spec §6)

Las comprobaciones de código se hicieron sobre `git diff a1d2ada..HEAD -- frontend`. El detalle regla por regla, con archivo y línea, está en [frontend-revision-diseno.md](frontend-revision-diseno.md). Resultado final tras los ajustes `6186427`, `5152727` y `36386f5`.

| #   | Punto                                          | Resultado | Nota                                                                                                                                                |
| --- | ---------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Ningún color ni medida a mano                  | ✅        | Única coincidencia: el breakpoint `@media (min-width: 48rem)`, que `DESIGN.md` permite                                                              |
| 2   | Ningún `style={{…}}` salvo `BarraProgreso`     | ✅        | Solo `BarraProgreso.tsx:29` (ancho de la barra)                                                                                                     |
| 3   | Sin clases de Bootstrap en el JSX nuevo        | ✅        | Coincidencias falsas: `detail-card-list` y `session-card` son clases propias de E1. `form-label` y `form-control` las permite D-13                  |
| 4   | Tipografía con `--fuente-*` y `--texto-*`      | ✅        | Los `h3` pasaron a `--fuente-titulo` y 20 (`6186427`). El tamaño 14 del rango y del estado del hito queda como excepción en `DESIGN.md` (`36386f5`) |
| 5   | Espaciado `--esp-*`, radios y bordes           | ✅        | `--radio-m` en bloques anidados, documentado en `DESIGN.md` (`36386f5`)                                                                             |
| 6   | Un solo botón primario por vista               | ✅        | «Crear meta» en secundario y «Reintentar» en neutro (`5152727`). Los primarios repetidos de E1 quedan fuera, ver diseño §3                          |
| 7   | Pares de contraste permitidos                  | ✅        | Rojo-oscuro sobre gris-card (6.1) y amarillo para el hito alcanzado añadidos a `DESIGN.md` (`36386f5`)                                              |
| 8   | Estados con texto, no solo color               | ✅        | «Alcanzado» / «Pendiente», «Inactiva», «¡Meta de la semana cumplida!» / «aún no cumplida»                                                           |
| 9   | Foco visible, tabulación, modal atrapa el foco | ✅        | Revisión en pantalla de la estudiante                                                                                                               |
| 10  | Controles de al menos 44 px                    | ✅        | `.ui-button` con `min-height: var(--alto-tactil)`, también en tamaño pequeño; revisión en pantalla                                                  |
| 11  | `role="progressbar"` con sus `aria-*`          | ✅        | `BarraProgreso` con `aria-valuetext` = `textoValor`                                                                                                 |
| 12  | `<label>` en cada campo, hitos numerados       | ✅        | «Descripción del hito N», «Objetivo del hito N (%)», «Quitar» con `aria-label`                                                                      |
| 13  | Iconos decorativos con `aria-hidden`           | ✅        | Los iconos sin `titulo` llevan `aria-hidden` (`iconos/index.tsx:17`)                                                                                |
| 14  | `prefers-reduced-motion`                       | ✅        | Sin transiciones nuevas; la de la barra ya se anula en `componentes.css`                                                                            |
| 15  | Cuatro estados (carga, error, vacío, sin meta) | ✅        | Los cuatro existen y se vieron en pantalla. El aviso de semana vacía sin acción (diseño #11) se cerró como sugerencia no incorporada                |
| 16  | Tono                                           | ✅        | Cumple. El mensaje de error que puede repetirse (diseño #19) se cerró como sugerencia no incorporada                                                |
| 17  | Fechas en hora de Ecuador                      | ✅        | Rango «9 nov al 15 nov» igual tras cambiar la zona del sistema                                                                                      |
| 18  | Sin `window.confirm` ni `window.alert`         | ✅        | Ninguna coincidencia en `frontend/src`                                                                                                              |
| 19  | 360 px y desde `48rem`                         | ✅        | Revisión en pantalla de la estudiante                                                                                                               |
| 20  | Sin dependencias nuevas                        | ✅        | `frontend/package.json` y el lock sin cambios                                                                                                       |

## 3. Verificación manual (spec §4)

**Entorno**, sin tocar el servidor de desarrollo del puerto 3000:

```sh
# backend/
PORT=3100 CORS_ORIGIN=http://localhost:5174 MONGODB_DB=diario_gamer_pruebas npx tsx src/server.ts
# frontend/
VITE_API_URL=http://localhost:3100 npx vite --port 5174 --strictPort
```

**Datos**, creados el domingo 15 de noviembre de 2026 con un script relativo a hoy. En la lista aparecen con el prefijo «UI ·»:

| Juego                  | Contenido                                                              | Criterios                               |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| UI · Dataset B         | Dataset B de la spec de backend: meta 5 h / 4 días, hitos 25, 50 y 100 | CA-04.x, 05.x, 06.x, 13.2, 02.x, 03.1-2 |
| UI · Sin meta          | 2 partidas de ayer, sin meta                                           | CA-07.1, 01.1 a 01.6, 01.8, 08.x        |
| UI · Meta sin partidas | Meta 5 h / 3 días con un hito de 25                                    | CA-07.2                                 |
| UI · Recién creado     | Nada                                                                   | CA-07.3, 13.5                           |
| UI · Abandonado        | Abandonado, con una meta inactiva (R-20)                               | CA-01.7, 03.6                           |
| UI · Dos inactivas     | Dos metas inactivas, sin activa                                        | CA-03.3, 03.4, 03.5, 02.2               |
| UI · Cumplida          | 2 h en 2 días con meta de 1 h / 2 días                                 | CA-13.1                                 |
| UI · Horas sí días no  | 3 h en 1 día con meta de 2 h / 3 días                                  | CA-13.2                                 |

Respuesta de la API para «UI · Dataset B» antes de abrir la interfaz: igual al JSON esperado de la spec de backend §6 (4.5 h, 90 %, 4 días, racha 3, mejor 4, hitos 25 y 50 alcanzados, `metaCumplida: false`).

**Resultados:** ✅ conforme · ❌ desviación (con nota). Todos los criterios pasaron en la revisión de la estudiante.

| Criterio        | Juego                  | Resultado | Nota                                        |
| --------------- | ---------------------- | --------- | ------------------------------------------- |
| CA-01.1         | UI · Sin meta          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.2         | UI · Sin meta          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.3         | UI · Recién creado     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.4         | UI · Recién creado     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.5         | UI · Recién creado     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.6         | UI · Dataset B         | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.7         | UI · Abandonado        | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-01.8         | UI · Sin meta          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-02.1         | UI · Dataset B         | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-02.2         | UI · Dos inactivas     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-02.3         | UI · Dataset B         | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-02.5         | UI · Dataset B         | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-03.1 / 03.2  | UI · Cumplida          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-03.3         | UI · Dos inactivas     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-03.4 / 03.5  | UI · Dos inactivas     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-03.6         | UI · Abandonado        | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-04 / 05 / 06 | UI · Dataset B         | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-07.1         | UI · Sin meta          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-07.2         | UI · Meta sin partidas | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-07.3         | UI · Recién creado     | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-08.1 / 08.2  | UI · Sin meta          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-09.1 a 09.4  | UI · Horas sí días no  | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-10.1 / 10.2  | UI · Meta sin partidas | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-13.1         | UI · Cumplida          | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-13.2         | UI · Horas sí días no  | ✅        | Verificado por la estudiante el 15 nov 2026 |
| CA-13.5         | UI · Recién creado     | ✅        | Verificado por la estudiante el 15 nov 2026 |
