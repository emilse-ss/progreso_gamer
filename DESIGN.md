# DESIGN.md · Diario de Progreso Gamer

Identidad visual y límites de diseño del frontend. Salen de [`frontend/src/estilos/tema.css`](frontend/src/estilos/tema.css) (tokens) y de [`frontend/src/components/ui/`](frontend/src/components/ui/) (componentes). **La fuente de verdad de los valores es `tema.css`**: este documento explica cómo usarlos; no los redefine.

Estilo: arcade y cómic. Bordes negros gruesos, sombra dura desplazada, esquinas redondeadas, títulos en cursiva muy gruesa y colores planos saturados sobre fondo crema.

## Regla de oro

**Ningún color ni medida se escribe a mano fuera de `tema.css`.** En componentes y páginas siempre se usa `var(--…)`. Si falta un valor, primero se añade el token a `tema.css`, con un nombre en español y en la familia que le corresponde, y después se usa.

Excepciones toleradas, porque no son tokens de diseño: `0`, `100%`, fracciones de layout (`1fr`, `50%`), `line-height` sin unidad, `opacity` de estados (`disabled`) y el _breakpoint_ `48rem`, ya que CSS no admite variables dentro de `@media`.

## Colores

| Token                          | Uso                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `--crema`                      | Fondo de la app, paneles, modales y alertas                                             |
| `--negro`                      | Texto principal y bordes (`--borde-grueso`)                                             |
| `--gris-card`                  | Fondo de tarjetas, bloques de detalle, filtros y botón neutro                           |
| `--carbon`                     | Encabezados de panel y modal, etiquetas de sección, pie y pista de la barra de progreso |
| `--amarillo`                   | Acción principal, pestaña o enlace activo y decoraciones                                |
| `--rojo` / `--rojo-oscuro`     | Navbar, acción destructiva y error / insignias y botón del menú                         |
| `--azul`                       | Acción secundaria, avisos informativos y estado «completado»                            |
| `--verde` / `--verde-oscuro`   | Estado «jugando» / relleno de progreso, éxito y barra de grupo                          |
| `--indigo` / `--indigo-oscuro` | Iconos de tarjeta, _hover_ de enlaces, anillo de foco y hero                            |
| `--naranja`, `--morado`        | Reservados: definidos, todavía sin uso. Si se usan, documentarlo aquí                   |

- **Estados del videojuego:** solo con los alias `--estado-<estado>` y `--estado-<estado>-texto`, nunca con el color base directamente.
- **Pares de contraste permitidos** (WCAG): negro sobre amarillo (12.2), crema (16.2), gris-card (15.3), verde (6.7) o azul (6.5); blanco sobre carbon (11.4), indigo (8.0), rojo (4.8) o verde-oscuro (4.8); rojo-oscuro sobre crema (6.4).
- **Prohibido:** texto negro sobre rojo (3.6). Sobre rojo, el texto siempre es blanco.
- Las variables `--bs-*` de `tema.css` solo sirven para que Bootstrap herede la paleta. No se usan en CSS propio.

## Tipografía

- **Títulos** (`h1`–`h6`, nombre en la navbar, números del resumen): `--fuente-titulo` (Kanit), cursiva, peso 800 o 900.
- **Texto, botones y formularios:** `--fuente-texto` (M PLUS Rounded 1c), pesos 400, 700 y 800.
- Se cargan desde Google Fonts en `frontend/index.html`. No se añaden más familias ni pesos.
- **Escala única:** `--texto-12`, `-14`, `-16`, `-20`, `-28` y `-40`.
  - 12: ayudas, fechas y estados.
  - 14: etiquetas y detalles.
  - 16: texto base y botones.
  - 20: títulos de tarjeta y sección.
  - 28 y 40: encabezados de panel, hero y cifras grandes.

## Espaciado y forma

- **Escala de 4 px:** `--esp-1` (4) a `--esp-8` (32). Las medidas mayores se componen con `calc()` sobre tokens, por ejemplo `calc(var(--esp-8) * 3)`.
- **Radios:** `--radio-m` (14) para controles, botones e iconos; `--radio-l` (18) para tarjetas, paneles, alertas y modales.
- **Bordes y sombra:** `--borde-grueso` en todo bloque con fondo propio. Los botones llevan `--sombra-dura` más `--filo-interior` y bajan `--esp-1` al pulsarlos.
- **Layout:** el contenido mide como máximo `--ancho-contenido` (960). Es _mobile-first_: una columna, y desde `48rem` dos o cuatro columnas.

## Componentes

Antes de crear algo nuevo, se usan los de `components/ui/`. Las clases son `ui-<componente>` y, para las variantes, `ui-<componente>--<variante>` (BEM).

| Componente                                                                      | Para qué                                                  | Variantes                                                                                             |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Boton`                                                                         | Toda acción                                               | `primario` (una por vista), `neutro`, `secundario`, `peligro`; tamaños `pequeno`, `mediano`, `grande` |
| `CardItem`                                                                      | Elemento de lista (videojuego, partida, logro)            | Icono, acción, insignia y barra de progreso opcionales                                                |
| `BarraProgreso`                                                                 | Porcentaje con `role="progressbar"` y etiqueta            | Hay que usarla para horas frente a la meta y días frente al objetivo                                  |
| `AlertMessage`                                                                  | Avisos de `info`, `success`, `warning`, `error` y `empty` | El estado vacío usa `empty` e invita a la acción                                                      |
| `Skeleton`                                                                      | Estado de carga                                           | `texto`, `bloque`, `tarjeta`, `resumen`, `formulario`, `detalle`                                      |
| `ModalConfirmacion`                                                             | Confirmar acciones destructivas (eliminar, desactivar)    | Foco atrapado, Escape cierra                                                                          |
| `Pestanas`                                                                      | Filtros excluyentes, con navegación por flechas           | Contador opcional                                                                                     |
| `EncabezadoPanel`, `EtiquetaSeccion`, `BarraGrupo`, `Insignia`, `PageContainer` | Estructura y títulos de página y de sección               | `BarraGrupo`: `verde`, `carbon`; `Insignia`: `esquina`, `contador`                                    |
| `iconos/`                                                                       | SVG propios con `currentColor`                            | `ui-icon`, `--small`, `--large`                                                                       |

Cada vista cubre cuatro estados: carga (`Skeleton`), error (`AlertMessage error` con «Reintentar»), vacío (`AlertMessage empty` con una acción) y datos.

## Bootstrap (D-13)

Bootstrap 5.3 está **autorizado solo como base CSS**: el _reboot_ y las clases de formulario, que heredan la paleta por medio de `--bs-*`.

- **Se permite:** `form-control`, `form-select`, `form-label`, `form-text`, `visually-hidden` y `visually-hidden-focusable`. Siempre dentro de un contenedor propio (`.ui-form`, `.achievement-form`, `.games-filter-field`) que les aplica los tokens.
- **No se permite:**
  - Los componentes de Bootstrap: `btn`, `card`, `alert`, `modal`, `navbar`, `badge`, `progress`, `nav-tabs`, `spinner`, `dropdown`.
  - Su JavaScript (`bootstrap.bundle`).
  - Su grid (`row`, `col-*`, `container`).
  - Sus utilidades de espaciado, color o tipografía (`m*-*`, `p*-*`, `text-*`, `bg-*`, `fw-*`, `d-*`).
  - Para todo eso se usan los componentes `ui-*` y los tokens.
- Ninguna otra librería de UI o CSS (Tailwind, MUI, styled-components, iconos externos) sin autorizarla antes aquí.
- **Desviaciones conocidas del código actual**, que se corrigen cuando se toque cada archivo:
  - `btn btn-outline-secondary` en `paginas/VideojuegoFormPage.tsx:102` (debe ser `Boton neutro`).
  - `mt-2` en `paginas/PartidaForm.tsx:155`.
  - `p-2` en `components/AppLayout.tsx:28`.
  - `theme-color` escrito a mano en `index.html`.

## Tono de los textos

- **Español neutro y tuteo:** «Registra la primera», «Aún no tienes partidas».
- Frases cortas y en positivo. El juego da el tono («Cada partida cuenta.»), pero sin jerga gamer forzada.
- **Errores:** primero qué falló y luego qué hacer: «No se pudo cargar el resumen.» + «Reintentar». Sin códigos técnicos ni mensajes en inglés.
- **Validaciones:** dicen la regla. Por ejemplo: «Un videojuego no puede tener más de 50 logros.»
- **Botones:** verbo en infinitivo («Guardar», «Agregar logro», «Eliminar»). La confirmación de una acción destructiva repite el objeto: «¿Eliminar _Hollow Knight_?».
- **Cifras y fechas:** formato `es-EC`. Las fechas se muestran en `America/Guayaquil` (`timeZone` explícito en `Intl.DateTimeFormat`; hoy falta, ver D-02).

## Accesibilidad

- Todo control interactivo mide como mínimo `--alto-tactil` (44 px).
- Foco visible con `:focus-visible` (`--ancho-foco` en `--indigo`). Nunca se quita el `outline`.
- Se respeta `prefers-reduced-motion`: sin transiciones ni animación del _skeleton_.
- Las alertas de error usan `role="alert"` y las demás `role="status"`. La carga usa `aria-live="polite"` y un texto oculto.
- Las barras de progreso llevan `aria-valuenow/min/max` y una etiqueta con el valor.
- Los iconos decorativos llevan `aria-hidden="true"`. Los botones que solo tienen icono llevan `aria-label`.
- El estado nunca se comunica solo con color: va acompañado de texto («Jugando», «Alcanzado»).
- Cada `input` tiene su `<label>`. Las ayudas se enlazan con `aria-describedby`.
- Hay un enlace «Saltar al contenido» al inicio de `AppLayout`.

## No hacemos

- Valores escritos a mano (`#hex`, `rgb()`, `px` o `rem` sueltos) en componentes, páginas o atributos `style`.
- Estilos en línea (`style={{…}}`), salvo un valor dinámico calculado, como el ancho de una barra de progreso.
- Componentes, grid, JavaScript o utilidades de Bootstrap fuera de lo permitido arriba.
- Gradientes, sombras difusas, _glassmorphism_, modo oscuro o fuentes nuevas que no estén en `tema.css`.
- Botones sin borde, o más de una acción `primario` por vista.
- Comunicar éxito o error solo con color, con emojis o con `window.alert` / `confirm` (se usa `ModalConfirmacion`).
- Animaciones de más de `--duracion-transicion`, o que no respeten `prefers-reduced-motion`.
- Textos en inglés, en mayúsculas sostenidas o con mensajes técnicos del backend mostrados tal cual.
