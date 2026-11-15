# PRD · Diario de Progreso Gamer (con la épica E2 «Metas y rachas»)

> Qué producto se construye y con qué reglas de negocio. **Sin detalle técnico**: el cómo va en `docs/specs/`. La fuente del producto es `contexto/ficha-cliente.md`. Lo que no está ni en la ficha ni en las decisiones de la estudiante figura como supuesto o como punto abierto.

## 1. Problema

La persona ya registra sus videojuegos y sus partidas (cuánto juega y cuánto avanza), pero **no sabe si está jugando lo que se propuso ni si es constante**. Su patrón típico es jugar mucho un fin de semana y luego abandonar el juego durante dos semanas. El diario responde «¿qué estoy jugando y cuánto llevo?», pero no «¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?».

## 2. Usuarios

Una sola persona: la misma que registra sus videojuegos y partidas en el diario. No hay cuentas, roles ni metas compartidas.

## 3. Objetivo y métrica

**Objetivo:** que la persona fije una meta semanal por videojuego y vea en el detalle del juego cómo va la semana, cuántos días seguidos lleva jugando y qué hitos de avance ha alcanzado.

**Métrica de éxito:** en un mes, la persona cumple su meta semanal (R-09) **al menos 3 de 4 semanas**.

- Es una métrica **del producto**, no una funcionalidad: la aplicación no muestra semanas pasadas (ver no-alcance). Se mide fuera de la aplicación, con las partidas y las metas guardadas, aplicando las mismas reglas de este documento a cada una de las cuatro semanas.

## 4. Alcance

**E1 · Registro (existente):** videojuegos con sus logros, partidas y el resumen de cada juego (horas totales, última partida y avance actual).

**E2 · Metas y rachas (nuevo):**

- Crear, editar, desactivar y reactivar la meta semanal de un videojuego, con sus hitos de avance, y ver la lista de sus metas inactivas.
- Ver, en el detalle del juego, el progreso de la **semana actual**: horas frente a la meta, días jugados frente a los días objetivo, si la meta está cumplida, racha actual, mejor racha y estado de cada hito.
- El progreso se actualiza al registrar o eliminar una partida.
- Reglas nuevas sobre las partidas (R-22) y sobre el avance actual (R-18), que protegen el cálculo del progreso.

## 5. No-alcance

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios y rankings.
- Gráficos históricos y consulta de semanas pasadas (también el cálculo de la métrica de éxito dentro de la aplicación).
- Borrar metas: solo se desactivan (R-15).
- Editar partidas: queda diferido; para corregir una partida, se elimina y se registra de nuevo (punto abierto P-01).

## 6. Conceptos y justificaciones

- **Meta:** propósito semanal de un videojuego, con horas por semana, días por semana y una lista corta de hitos. **Es una entidad propia, no parte de la ficha del juego,** porque tiene su propio ciclo de vida: se crea, se edita, se desactiva y se reactiva sin tocar el videojuego. Además, las metas anteriores se conservan como historial.
- **Hito:** un objetivo de avance dentro de una meta, por ejemplo «Llegar al 50 %». **Vive dentro de su meta** porque es una lista corta (como máximo 5) que no tiene sentido fuera de ella.
- **«Alcanzado» no se guarda: se calcula** cada vez con el avance actual del juego. El avance ya existe en las partidas; guardarlo otra vez en el hito crearía dos versiones del mismo dato que pueden contradecirse, por ejemplo al eliminar la partida que lo alcanzó.
- **Avance actual:** el porcentaje de avance de la partida más reciente que lo tenga (R-18).
- **Día de una partida:** el día del calendario, en hora de Ecuador, en que **empieza** la partida.

## 7. Reglas de negocio

Los IDs son estables: no se renumeran ni se reutilizan.

**Calendario de los ejemplos** (noviembre de 2026, hora de Ecuador). Salvo que se indique otra cosa, «hoy» es el **domingo 15**.

| Lun | Mar | Mié | Jue | Vie | Sáb | Dom |
| --- | --- | --- | --- | --- | --- | --- |
| 9   | 10  | 11  | 12  | 13  | 14  | 15  |
| 16  | 17  | 18  | 19  | 20  | 21  | 22  |

### Semana, días y horas

**R-01 · Semana.** La semana va de lunes a 00:00 a domingo a 23:59, en hora de Ecuador.
_Ejemplo:_ una partida del domingo 15 a las 22:00 pertenece a la semana del 9 al 15; una del lunes 16 a las 00:10, a la semana del 16 al 22.

**R-02 · Día de una partida.** Una partida pertenece entera al día de Ecuador en que empieza, aunque cruce la medianoche.
_Ejemplo:_ una partida que empieza el domingo 15 a las 23:30 y dura 90 minutos suma 1.5 h a la semana del 9 al 15 y marca el domingo como día jugado. El lunes 16 no queda como jugado por esa partida.

**R-03 · Días jugados.** Días jugados de la semana = días distintos con al menos una partida. Varias partidas el mismo día cuentan como un solo día, y sus horas se suman.
_Ejemplo:_ el martes 10 hay partidas a las 10:00 (60 min), a las 21:00 (45 min) y a las 23:30 (30 min): cuentan 1 día jugado y 2.3 h.

**R-07 · Horas de la semana.** Suma de las duraciones de las partidas de la semana, expresada en horas y redondeada a un decimal.
_Ejemplo:_ 60 + 45 + 30 = 135 min → 2.3 h.

**R-08 · Porcentaje de horas.** Horas de la semana (ya redondeadas) divididas entre las horas de la meta, en porcentaje entero y **con tope en 100 %**.
_Ejemplo:_ con una meta de 5 h, jugar 2 h el lunes 9, 3 h el miércoles 11 y 2 h el sábado 14 (7 h en total) da 100 %, no 140 %. Con la misma meta, 298 minutos son 5.0 h, que también dan 100 %.

**R-09 · Meta semanal cumplida.** La meta de una semana se cumple cuando se llega al 100 % de las horas **y** se alcanzan los días objetivo. La sección de progreso indica si la meta de la semana actual está cumplida o no.
_Ejemplo:_ con una meta de 5 h y 4 días, jugar 5 h solo el sábado 14 **no** la cumple (1 de 4 días) y así se indica. Jugar 1.5 h el lunes 9, el miércoles 11, el viernes 13 y el domingo 15 (6 h en 4 días) sí la cumple y se indica como cumplida.

**R-10 · Meta con la que se evalúa la semana.** La semana se evalúa con la meta activa en el momento de consultar, para la semana completa. Eso incluye las partidas anteriores a la creación o a la edición de la meta.
_Ejemplo:_ la meta de 5 h se cambia a 10 h el miércoles 11 a las 18:00. El domingo 15, con 6 h jugadas en la semana, el progreso es del 60 % (6 de 10), no del 120 %. Del mismo modo, si la meta se crea el jueves 12, las partidas del lunes 9 al miércoles 11 cuentan.

**R-11 · Sin meta o sin partidas.** Sin meta activa se muestran horas, días jugados y rachas, pero no el porcentaje ni la meta. Sin partidas, horas, días y rachas valen 0 y ningún hito está alcanzado.
_Ejemplo:_ un juego sin meta, con 2 h jugadas el martes 10, muestra 2.0 h y 1 día, sin porcentaje. Un juego recién creado el lunes 16 muestra 0 h, 0 días y racha 0.

### Racha

**R-04 · Racha.** Una racha es una sucesión de días consecutivos con al menos una partida de ese videojuego. El avance de las partidas no influye: cualquier partida cuenta.
_Ejemplo:_ partidas el jueves 12 (avance 30 %), el viernes 13 (sin cambio de avance) y el sábado 14 forman una racha de 3 días.

**R-05 · Racha actual y el día de hoy.** La racha actual sigue viva si ayer hubo partida aunque hoy todavía no la haya. Se rompe cuando termina un día completo sin partida.
_Ejemplo:_ con partidas el jueves 12, el viernes 13 y el sábado 14:

| Momento                                       | Racha actual   |
| --------------------------------------------- | -------------- |
| Domingo 15 a las 10:00, sin partida hoy       | 3 (sigue viva) |
| Domingo 15 a las 23:30, juega                 | 4              |
| Lunes 16 a las 09:00, sin partida hoy         | 4 (sigue viva) |
| Martes 17 a las 09:00, si el lunes 16 no jugó | 0              |

**R-06 · Mejor racha.** La racha más larga de todo el historial del videojuego, incluida la actual.
_Ejemplo:_ con partidas del 1 al 9 de noviembre y luego del 12 al 15, la racha actual es 4 y la mejor racha es 9.

### Meta

**R-12 · Límites de la meta.** Una meta define horas por semana (un número entero de 1 a 100) y días por semana (un número entero de 1 a 7).
_Ejemplo:_ «5 h en 3 días» es válida. «4.5 h», «0 h», «120 h» y «8 días» se rechazan.

**R-13 · Una sola meta activa.** Un videojuego tiene como máximo una meta activa. Intentar tener una segunda se rechaza con un mensaje claro.
_Ejemplo:_ si «Hades» tiene una meta activa desde el lunes 9, crear otra el miércoles 11 se rechaza. Para cambiarla, se edita la actual (R-14) o se desactiva y se crea una nueva.

**R-14 · Edición.** Solo se puede editar la meta activa: horas, días e hitos. El videojuego al que pertenece una meta no cambia nunca. La edición se aplica a la semana en curso según R-10.
_Ejemplo:_ el jueves 12, la meta activa de «Hades» pasa de 3 a 5 días. Una meta desactivada el lunes 9 no se puede editar.

**R-15 · Desactivar, reactivar y conservar.** Una meta se puede desactivar y volver a activar, pero no se borra. Las metas inactivas forman el historial del juego: la persona ve la lista de metas inactivas de cada juego y puede reactivar cualquiera de ellas. La reactivación respeta R-13 y R-19.
_Ejemplo:_ la meta A se desactiva el lunes 9 y se crea la B. El viernes 13, reactivar A se rechaza porque B está activa; si antes se desactiva B, A puede reactivarse.

**R-16 · Hitos.** Una meta tiene entre 0 y 5 hitos. Cada hito tiene un objetivo entero de 1 a 100 % y una descripción opcional. No puede haber dos hitos con el mismo objetivo en una meta, y se muestran ordenados de menor a mayor objetivo.
_Ejemplo:_ los hitos «50 %, 25 %, 100 %» se muestran como 25 %, 50 % y 100 %. «50 % Mitad» junto con «50 % Mitad otra vez» se rechaza, igual que un hito de «33.3 %». Una meta sin hitos es válida.

**R-17 · Hito alcanzado.** Un hito está alcanzado **mientras** el avance actual sea mayor o igual que su objetivo; si el avance baja, deja de estarlo.
_Ejemplo:_ hitos de 25 % y 50 %. El lunes 9 se registra una partida con avance 55: los dos están alcanzados. El miércoles 11 se registra otra con avance 40: el de 25 % sigue alcanzado y el de 50 % ya no.

**R-18 · Avance actual.** El avance actual es el de la partida más reciente que tenga avance. Las partidas anteriores sin avance se ignoran, y las nuevas deben indicarlo.
_Ejemplo:_ partida del martes 10 con avance 60 y partida antigua del jueves 12 sin avance: el avance actual es 60, no 0, y el hito de 50 % sigue alcanzado.

### Estado y eliminación del videojuego

**R-19 · Juegos completados o abandonados.** Un videojuego completado o abandonado no puede tener una meta activa: no se le crea ni se le reactiva una.
_Ejemplo:_ «Hades» pasa a abandonado el miércoles 11. El lunes 16, crear una meta para «Hades» se rechaza con un mensaje que explica su estado.

**R-20 · Cambio de estado con meta activa.** Si un videojuego pasa a completado o abandonado, su meta activa se desactiva sola y queda en el historial.
_Ejemplo:_ «Celeste» tiene una meta activa y el viernes 13 se marca como completado: desde ese momento no tiene meta activa y su progreso se muestra como en R-11.

**R-21 · Eliminar un videojuego.** Eliminar un videojuego elimina también todas sus metas, activas e inactivas, con sus hitos, además de sus partidas.
_Ejemplo:_ un juego con 1 meta activa, 2 inactivas y 12 partidas se elimina el sábado 14: no queda ninguna de sus metas ni de sus partidas.

### Partidas (protección del cálculo)

**R-22 · Partidas válidas.** Una partida nueva debe tener fecha **y hora**, no puede ser de un día posterior a hoy en Ecuador y debe durar entre 5 y 1440 minutos (24 h).
_Ejemplo:_ con hoy domingo 15, se acepta una partida del domingo 15 a las 18:00 aunque sean las 10:00. Se rechazan una del lunes 16, una con fecha «10 de noviembre» sin hora, una de 3 minutos y una de 3000 minutos.

**R-23 · Partidas posteriores a hoy.** El progreso ignora las partidas de días posteriores a hoy en Ecuador. Las de hoy cuentan aunque su hora sea posterior a la actual.
_Ejemplo:_ si existe una partida antigua con fecha del martes 17, el domingo 15 no suma horas ni días ni alarga la racha. Una del domingo 15 a las 18:00 sí cuenta desde que se registra.

## 8. Cobertura de los huecos

| Hueco                                        | Decisión                                                                     | Regla      |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| 1. Racha y día de hoy                        | La racha sigue viva hasta que termine el día                                 | R-05       |
| 2. Varias partidas el mismo día              | Cuentan un día y las horas se suman                                          | R-03       |
| 3. Partida que cruza la medianoche           | Pertenece entera al día de inicio                                            | R-02       |
| 4. Cambio de meta a mitad de semana          | Se usa la meta activa al consultar, para toda la semana                      | R-10, R-14 |
| 5. Meta superada                             | Tope en 100 %                                                                | R-08       |
| 6. Hito ya alcanzado                         | Se recalcula: puede dejar de estar alcanzado                                 | R-17, R-18 |
| 7. Videojuego completado o abandonado        | No puede tener meta activa                                                   | R-19       |
| 8. Eliminar un videojuego con meta           | Se eliminan todas sus metas e hitos                                          | R-21       |
| A. Cómo se mide el éxito                     | Métrica de producto, medida fuera de la aplicación                           | §3         |
| B. Qué es cumplir la meta                    | Horas y días                                                                 | R-09       |
| C. Desactivar o crear meta nueva             | Se conserva el historial; se reactiva; no se borra                           | R-13, R-15 |
| D. Editar una meta                           | Solo la activa; el videojuego no cambia                                      | R-14       |
| E. Hitos repetidos o desordenados            | Se rechazan los repetidos; se ordenan; descripción opcional; 0 hitos válidos | R-16       |
| F. Fechas futuras y duraciones extremas      | No posterior a hoy; con hora; de 5 a 1440 min                                | R-22       |
| G. El juego cambia de estado con meta activa | La meta se desactiva sola                                                    | R-20       |
| H. Racha con avance cero o faltante          | El avance no influye; avance actual = último con avance                      | R-04, R-18 |
| I. Redondeo del porcentaje                   | Sobre las horas ya redondeadas                                               | R-08       |
| J. Semana en que se crea la meta             | Cuentan las partidas anteriores a la creación                                | R-10       |
| K. Partidas posteriores a hoy ya guardadas   | Se ignoran                                                                   | R-23       |

## 9. Supuestos

- **S-01:** hay una única persona usuaria; no hay inicio de sesión.
- **S-02:** las partidas ya guardadas antes de R-22 (sin hora, o de menos de 5 minutos) se conservan y cuentan tal como están.
- **S-03:** al editar la meta activa se modifica esa misma meta; no se crea una nueva en el historial.
- **S-04:** el «hoy» de todas las reglas es el día actual en hora de Ecuador, independientemente de dónde esté la persona.
- **S-05:** el volumen de partidas de un videojuego es pequeño (uso personal), así que la racha puede recalcularse sobre todo el historial en cada consulta.

## 10. Puntos abiertos

- **P-01 · Editar partidas:** diferido. Para corregir una fecha o un avance hay que eliminar la partida y registrarla de nuevo. El progreso se recalcula igualmente.
- **P-02 · Eliminación no atómica:** si la eliminación de un videojuego falla a mitad del proceso, pueden quedar algunas metas o partidas sueltas. El riesgo es bajo y se acepta en esta épica.
- **P-03 · Hito sin descripción:** el texto que muestra la interfaz cuando un hito no tiene descripción se decide en la spec del frontend.
