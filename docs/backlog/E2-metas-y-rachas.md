# Backlog · E2 «Metas y rachas»

> Historias, criterios de aceptación y tickets de la épica E2. Las reglas `R-XX` están en `docs/prd/PRD.md`; el alcance, en `epicas.md`. Los criterios describen comportamiento observable **sin detalle técnico**. El cómo (contratos, archivos, verificaciones) va en `docs/specs/`.
>
> Los IDs son estables: no se renumeran ni se reutilizan.

**Calendario de los ejemplos** (noviembre de 2026, hora de Ecuador). Cada criterio indica qué día y qué hora son «ahora».

| Lun | Mar | Mié | Jue | Vie | Sáb | Dom |
| --- | --- | --- | --- | --- | --- | --- |
| 9   | 10  | 11  | 12  | 13  | 14  | 15  |
| 16  | 17  | 18  | 19  | 20  | 21  | 22  |

**Supuestos para los criterios** (confirmados al aprobar la propuesta):

- Un juego que vuelve a «jugando» no recupera su meta: sigue inactiva hasta que se reactiva a mano. El estado «pausado» no afecta a la meta.
- Con meta y sin partidas se muestran 0 h, 0 % y 0 días frente a la meta.
- Las duraciones de los ejemplos están en minutos enteros.

---

## 1. Historias

| ID    | Historia                                                                                                                                                                     | INVEST                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| HU-01 | Como jugadora, quiero **fijar una meta semanal** (horas, días e hitos) para un videojuego, para saber qué me propuse                                                         | Independiente del progreso; valiosa sola; se verifica con límites, una sola meta activa y el estado del juego |
| HU-02 | Como jugadora, quiero **editar mi meta activa**, para ajustarla sin perder el seguimiento de la semana                                                                       | Pequeña: solo la meta activa; se verifica con «inactiva no editable» y «el juego no cambia»                   |
| HU-03 | Como jugadora, quiero **desactivar una meta y reactivarla desde la lista de metas inactivas**, sin borrarla, para pausar mi propósito y conservar el historial               | Separada de HU-01 para ser pequeña; se verifica con la regla de una sola meta activa                          |
| HU-04 | Como jugadora, quiero **ver las horas y los días jugados de esta semana frente a mi meta**, para saber si voy cumpliendo                                                     | Núcleo del valor; estimable (cálculo puro); se verifica con fechas de lunes a domingo                         |
| HU-05 | Como jugadora, quiero **ver mi racha actual y mi mejor racha**, para saber si soy constante                                                                                  | Independiente de la meta (funciona sin ella); se verifica con «hoy sin partida, ayer sí»                      |
| HU-06 | Como jugadora, quiero **ver mis hitos y si están alcanzados**, para seguir mi avance en el juego                                                                             | Depende solo del avance actual; se verifica con un hito que deja de estar alcanzado                           |
| HU-07 | Como jugadora, quiero **ver mi progreso aunque no tenga meta o no tenga partidas**, con una invitación a crear la meta, para no encontrar una pantalla vacía o un error      | Pequeña: dos casos límite; fácil de verificar                                                                 |
| HU-08 | Como jugadora, quiero que **el progreso se actualice al registrar o eliminar una partida**, para ver siempre datos al día                                                    | Pequeña, propia de la interfaz; se verifica comparando antes y después                                        |
| HU-09 | Como jugadora, quiero que **un juego completado o abandonado no conserve una meta activa**, para que mis metas reflejen lo que de verdad juego                               | Separada de HU-01 (cambio de estado posterior); se verifica con un juego que pasa a «completado»              |
| HU-10 | Como jugadora, quiero que **al eliminar un videojuego se eliminen también sus metas**, para no dejar datos sueltos                                                           | Pequeña; se verifica con un juego con 1 meta activa y 2 inactivas                                             |
| HU-11 | Como jugadora, quiero que **la app rechace partidas imposibles** (sin hora, de días futuros, de menos de 5 min o de más de 24 h), para que mis horas y mi racha sean fiables | Deuda D-10 y D-02; pequeña; se verifica con 4 rechazos                                                        |
| HU-12 | Como jugadora, quiero que **mi avance actual no se pierda por una partida sin avance**, para que mis hitos no desaparezcan                                                   | Deuda D-03; pequeña; se verifica con 60 % seguido de una partida sin avance                                   |
| HU-13 | Como jugadora, quiero **ver si cumplí la meta de esta semana**, para saber de un vistazo si voy bien                                                                         | Independiente de rachas e hitos; pequeña (una indicación); se verifica con horas sí / días no y al revés      |

---

## 2. Criterios de aceptación

### HU-01 · Fijar una meta semanal

**CA-01.1 · Crear una meta válida** (R-12)
DADO que «Hades» está en estado «jugando» y no tiene meta,
CUANDO el lunes 9 a las 10:00 la jugadora crea una meta de 5 h y 3 días por semana,
ENTONCES «Hades» tiene una meta activa de 5 h y 3 días.

**CA-01.2 · Límites de horas y días** (R-12)
DADO que «Hades» no tiene meta,
CUANDO la jugadora intenta crear una meta de 4.5 h, de 0 h, de 120 h, de 0 días o de 8 días,
ENTONCES la meta no se crea y un mensaje indica qué valor está fuera del rango permitido (horas enteras de 1 a 100; días enteros de 1 a 7).

**CA-01.3 · Hitos ordenados** (R-16)
DADO que «Hades» no tiene meta,
CUANDO la jugadora crea una meta con los hitos «50 % Mitad», «25 % Un cuarto» y «100 % Terminar»,
ENTONCES la meta se crea y los hitos se muestran en el orden 25 %, 50 % y 100 %.

**CA-01.4 · Hitos inválidos** (R-16)
DADO que «Hades» no tiene meta,
CUANDO la jugadora intenta crear una meta con 6 hitos, o con dos hitos de 50 %, o con un hito de 33.3 %, o con un hito de 0 % o de 101 %,
ENTONCES la meta no se crea y un mensaje explica la causa.

**CA-01.5 · Meta sin hitos** (R-16)
DADO que «Hades» no tiene meta,
CUANDO la jugadora crea una meta de 5 h y 3 días sin hitos,
ENTONCES la meta se crea con la lista de hitos vacía.

**CA-01.6 · Segunda meta activa** (R-13)
DADO que «Hades» tiene una meta activa de 5 h y 3 días desde el lunes 9,
CUANDO el miércoles 11 a las 18:00 la jugadora intenta crear otra meta de 10 h y 5 días,
ENTONCES la segunda meta no se crea, un mensaje indica que el juego ya tiene una meta activa y la meta de 5 h y 3 días sigue igual.

**CA-01.7 · Juego completado o abandonado** (R-19)
DADO que «Hades» pasó a «abandonado» el miércoles 11 y «Celeste» está «completado»,
CUANDO el lunes 16 la jugadora intenta crear una meta para cualquiera de los dos,
ENTONCES la meta no se crea y un mensaje explica que el juego está abandonado o completado.

**CA-01.8 · Descripción del hito obligatoria** (R-16, S-06)
DADO que «Hades» no tiene meta,
CUANDO el lunes 9 la jugadora intenta crear una meta de 5 h y 3 días con un hito de 75 % y descripción: (a) vacía, (b) formada solo por espacios o (c) de 101 caracteres,
ENTONCES la meta no se crea y un mensaje indica que la descripción del hito es obligatoria y tiene como máximo 100 caracteres.
Y CUANDO la crea con la descripción « Mitad » o con una de exactamente 100 caracteres,
ENTONCES la meta se crea y el hito se guarda como «Mitad» (sin los espacios) o con sus 100 caracteres.

### HU-02 · Editar la meta activa

**CA-02.1 · Editar horas, días e hitos** (R-14)
DADO que «Hades» tiene una meta activa de 5 h y 3 días con un hito de 50 %,
CUANDO el jueves 12 la jugadora la cambia a 8 h y 4 días y añade un hito de 25 %,
ENTONCES la meta activa es de 8 h y 4 días, con los hitos 25 % y 50 % en ese orden.

**CA-02.2 · Una meta inactiva no se edita** (R-14)
DADO que «Hades» tiene una meta de 5 h desactivada el lunes 9,
CUANDO la jugadora intenta editarla,
ENTONCES la interfaz no ofrece editarla y, si se intenta, se rechaza sin cambiar sus valores.

**CA-02.3 · El videojuego de una meta no cambia** (R-14)
DADO que la meta activa pertenece a «Hades»,
CUANDO la jugadora la edita,
ENTONCES no puede asignarla a otro videojuego: la meta sigue perteneciendo a «Hades».

**CA-02.4 · La edición vale para toda la semana** (R-10)
DADO que «Hades» tiene una meta activa de 5 h y que hay 4 h jugadas del lunes 9 al miércoles 11,
CUANDO el jueves 12 a las 09:00 la jugadora cambia la meta a 10 h y consulta el progreso,
ENTONCES el progreso es del 40 % (4 de 10), no del 80 %.

**CA-02.5 · Edición con valores inválidos** (R-12, R-16)
DADO que «Hades» tiene una meta activa de 5 h y 3 días,
CUANDO la jugadora intenta cambiarla a 4.5 h, a 8 días o con dos hitos de 50 %,
ENTONCES el cambio se rechaza con un mensaje y la meta sigue siendo de 5 h y 3 días.

### HU-03 · Desactivar y reactivar desde la lista

**CA-03.1 · Desactivar con confirmación** (R-15)
DADO que «Hades» tiene una meta activa de 5 h y 3 días,
CUANDO el viernes 13 la jugadora elige desactivarla y confirma,
ENTONCES «Hades» queda sin meta activa, la meta aparece en la lista de metas inactivas y el progreso se muestra como «sin meta» (CA-07.1).

**CA-03.2 · Cancelar la desactivación** (R-15)
DADO que «Hades» tiene una meta activa,
CUANDO la jugadora elige desactivarla y cancela la confirmación,
ENTONCES la meta sigue activa.

**CA-03.3 · Lista de metas inactivas** (R-15)
DADO que «Hades» tiene dos metas inactivas (5 h / 3 días y 8 h / 4 días),
CUANDO la jugadora abre el detalle de «Hades»,
ENTONCES ve la lista con las dos metas inactivas, cada una con sus horas, sus días y sus hitos, y ninguna opción para borrarlas.

**CA-03.4 · Reactivar desde la lista** (R-15)
DADO que «Hades» no tiene meta activa y tiene la meta inactiva de 8 h y 4 días,
CUANDO el sábado 14 la jugadora la reactiva desde la lista,
ENTONCES esa meta pasa a ser la activa y sale de la lista de inactivas.

**CA-03.5 · No reactivar si ya hay otra activa** (R-13, R-15)
DADO que «Hades» tiene una meta activa B y una meta inactiva A,
CUANDO la jugadora intenta reactivar A,
ENTONCES A no se reactiva, un mensaje indica que ya hay una meta activa y B sigue activa.

**CA-03.6 · No reactivar en un juego abandonado** (R-19)
DADO que «Hades» está «abandonado» y tiene una meta inactiva,
CUANDO la jugadora intenta reactivarla,
ENTONCES la meta no se reactiva y un mensaje explica el estado del juego.

### HU-04 · Horas y días de la semana

**CA-04.1 · Semana de lunes a domingo** (R-01)
DADO que «Hades» tiene una partida el domingo 8 a las 22:00 (60 min), otra el miércoles 11 a las 20:00 (60 min) y otra el lunes 16 a las 00:30 (30 min),
CUANDO la jugadora consulta el progreso el domingo 15 a las 21:00,
ENTONCES la semana mostrada es del 9 al 15, con 1.0 h y 1 día jugado.
Y CUANDO lo consulta el lunes 16 a las 10:00,
ENTONCES la semana es del 16 al 22, con 0.5 h y 1 día jugado.

**CA-04.2 · Partida que cruza la medianoche, de domingo a lunes** (R-02)
DADO que hay una partida que empieza el domingo 15 a las 23:30 y dura 90 min,
CUANDO la jugadora consulta el progreso el domingo 15 a las 23:59,
ENTONCES la semana del 9 al 15 suma 1.5 h y el domingo cuenta como día jugado.
Y CUANDO lo consulta el lunes 16 a las 10:00,
ENTONCES la semana del 16 al 22 muestra 0 h y 0 días: esa partida no cuenta para el lunes.

**CA-04.3 · Varias partidas el mismo día, una a las 23:30** (R-03, R-07)
DADO que el martes 10 hay partidas a las 10:00 (60 min), a las 21:00 (45 min) y a las 23:30 (30 min),
CUANDO la jugadora consulta el progreso el miércoles 11 a las 09:00,
ENTONCES ve 1 día jugado y 2.3 h.

**CA-04.4 · Porcentaje de horas** (R-07, R-08)
DADO que «Hades» tiene una meta de 5 h y que la semana suma 210 min,
CUANDO la jugadora consulta el progreso el jueves 12,
ENTONCES ve 3.5 h y un 70 %.

**CA-04.5 · Meta superada** (R-08)
DADO que «Hades» tiene una meta de 5 h y partidas de 2 h el lunes 9, de 3 h el miércoles 11 y de 2 h el sábado 14,
CUANDO la jugadora consulta el progreso el domingo 15,
ENTONCES ve 7.0 h y un 100 %, no un 140 %.

**CA-04.6 · Redondeo antes del porcentaje** (R-08)
DADO que «Hades» tiene una meta de 5 h y que la semana suma 298 min,
CUANDO la jugadora consulta el progreso,
ENTONCES ve 5.0 h y un 100 %.

**CA-04.7 · Partidas anteriores a la creación de la meta** (R-10)
DADO que hay 2 h jugadas el lunes 9 y que la meta de 5 h se crea el jueves 12 a las 10:00,
CUANDO la jugadora consulta el progreso el jueves 12 a las 11:00,
ENTONCES ve 2.0 h y un 40 %.

**CA-04.8 · Partida de un día futuro ya guardada** (R-23)
DADO que existe una partida antigua con fecha del martes 17 (120 min) y otra del miércoles 11 (60 min),
CUANDO la jugadora consulta el progreso el domingo 15,
ENTONCES ve 1.0 h y 1 día: la partida del martes 17 no cuenta.

**CA-04.9 · Partida de hoy con hora posterior** (R-23)
DADO que son las 10:00 del domingo 15 y la semana suma 2.0 h,
CUANDO la jugadora registra una partida del domingo 15 a las 18:00 de 60 min y consulta el progreso,
ENTONCES ve 3.0 h y el domingo cuenta como día jugado.

### HU-05 · Racha actual y mejor racha

**CA-05.1 · Racha de días consecutivos, sin importar el avance** (R-04)
DADO que hay partidas el jueves 12 (avance 30 %), el viernes 13 (avance 30 %, sin cambio) y el sábado 14,
CUANDO la jugadora consulta el progreso el sábado 14 a las 21:00,
ENTONCES la racha actual es 3.

**CA-05.2 · Hoy sin partida y ayer sí** (R-05)
DADO las partidas del jueves 12, el viernes 13 y el sábado 14,
CUANDO la jugadora consulta el progreso el domingo 15 a las 10:00, sin partida ese día,
ENTONCES la racha actual es 3: sigue viva.

**CA-05.3 · Un día completo sin partida rompe la racha** (R-05, R-06)
DADO las partidas del jueves 12, el viernes 13 y el sábado 14, y ninguna el domingo 15 ni el lunes 16,
CUANDO la jugadora consulta el progreso el martes 17 a las 09:00,
ENTONCES la racha actual es 0 y la mejor racha es 3.

**CA-05.4 · La racha cruza de domingo a lunes** (R-02, R-05)
DADO las partidas del jueves 12 al sábado 14 y una partida el domingo 15 a las 23:30 (20 min),
CUANDO la jugadora consulta el progreso el lunes 16 a las 09:00, sin partida ese día,
ENTONCES la racha actual es 4.

**CA-05.5 · Mejor racha del historial** (R-06)
DADO que hay partidas todos los días del domingo 1 al lunes 9 y del jueves 12 al domingo 15,
CUANDO la jugadora consulta el progreso el domingo 15 a las 20:00,
ENTONCES la racha actual es 4 y la mejor racha es 9.

**CA-05.6 · Varias partidas el mismo día en la racha** (R-03, R-04)
DADO que hay dos partidas el jueves 12 (10:00 y 22:00) y una el viernes 13,
CUANDO la jugadora consulta el progreso el viernes 13 a las 23:00,
ENTONCES la racha actual es 2.

**CA-05.7 · Una partida de un día futuro no alarga la racha** (R-23)
DADO las partidas del jueves 12 al sábado 14 y una partida antigua con fecha del martes 17,
CUANDO la jugadora consulta el progreso el domingo 15 a las 10:00,
ENTONCES la racha actual es 3 y la mejor racha es 3.

### HU-06 · Hitos

**CA-06.1 · Hitos alcanzados** (R-17)
DADO una meta con hitos de 25 %, 50 % y 100 %, y una partida del lunes 9 con avance 55 %,
CUANDO la jugadora consulta el progreso el lunes 9 a las 21:00,
ENTONCES los hitos de 25 % y 50 % están alcanzados y el de 100 % no.

**CA-06.2 · Un hito deja de estar alcanzado** (R-17)
DADO el caso de CA-06.1,
CUANDO el miércoles 11 se registra una partida con avance 40 % y se consulta el progreso,
ENTONCES el hito de 25 % sigue alcanzado y el de 50 % ya no.

**CA-06.3 · Avance igual al objetivo** (R-17)
DADO una meta con un hito de 50 % y una partida del martes 10 con avance 50 %,
CUANDO la jugadora consulta el progreso,
ENTONCES el hito de 50 % está alcanzado.

**CA-06.4 · Orden de los hitos** (R-16)
DADO una meta creada con los hitos 100 %, 25 % y 50 %,
CUANDO la jugadora consulta el progreso,
ENTONCES los hitos se muestran como 25 %, 50 % y 100 %, cada uno con su estado.

### HU-07 · Sin meta activa o sin partidas

**CA-07.1 · Sin meta activa** (R-11)
DADO que «Hades» no tiene meta activa y tiene una partida de 120 min el martes 10,
CUANDO la jugadora consulta el progreso el miércoles 11,
ENTONCES ve 2.0 h, 1 día jugado y la racha, no ve porcentaje, meta ni hitos, y ve una invitación a crear una meta.

**CA-07.2 · Con meta y sin partidas** (R-11)
DADO que «Hades» tiene una meta de 5 h y 3 días con un hito de 25 % y ninguna partida,
CUANDO la jugadora consulta el progreso el lunes 16,
ENTONCES ve 0 h, 0 %, 0 de 3 días, racha actual 0, mejor racha 0 y el hito de 25 % no alcanzado.

**CA-07.3 · Sin meta y sin partidas** (R-11)
DADO que «Celeste» se registró el lunes 16, sin meta ni partidas,
CUANDO la jugadora abre su detalle,
ENTONCES ve 0 h, 0 días y racha 0, y una invitación a crear una meta, sin ningún mensaje de error.

### HU-08 · Refresco del progreso (enunciado §7.4)

**CA-08.1 · Al registrar una partida**
DADO que el detalle de «Hades» muestra 2.0 h, 1 día y racha 1 el domingo 15 a las 14:00, con la última partida del sábado 14,
CUANDO la jugadora registra una partida del domingo 15 a las 14:00 de 60 min y vuelve al detalle,
ENTONCES el progreso muestra 3.0 h, 2 días y racha 2, sin que tenga que recargar la página.

**CA-08.2 · Al eliminar una partida**
DADO que el detalle de «Hades» muestra 3.0 h y 2 días,
CUANDO la jugadora elimina la partida del domingo 15 (60 min) y confirma,
ENTONCES el progreso muestra 2.0 h y 1 día, sin que tenga que recargar la página.

### HU-09 · Juego completado o abandonado con meta activa

**CA-09.1 · Pasa a completado** (R-20)
DADO que «Celeste» tiene una meta activa de 5 h y 3 días,
CUANDO el viernes 13 la jugadora marca «Celeste» como completado,
ENTONCES «Celeste» queda sin meta activa, la meta aparece en la lista de metas inactivas y el progreso se muestra como «sin meta».

**CA-09.2 · Pasa a abandonado** (R-20)
DADO que «Hades» tiene una meta activa,
CUANDO el viernes 13 la jugadora marca «Hades» como abandonado,
ENTONCES «Hades» queda sin meta activa y la meta aparece en la lista de inactivas.

**CA-09.3 · Pausado no afecta a la meta** (R-20, supuesto)
DADO que «Hades» tiene una meta activa,
CUANDO la jugadora marca «Hades» como pausado,
ENTONCES la meta sigue activa.

**CA-09.4 · Volver a «jugando» no reactiva la meta** (R-15, R-20, supuesto)
DADO que «Celeste» pasó a completado el viernes 13 y su meta quedó inactiva,
CUANDO el lunes 16 la jugadora la marca de nuevo como «jugando»,
ENTONCES «Celeste» sigue sin meta activa hasta que la jugadora reactive una desde la lista.

### HU-10 · Eliminar un videojuego con metas

**CA-10.1 · Se eliminan todas sus metas** (R-21)
DADO que «Hades» tiene 1 meta activa, 2 metas inactivas y 12 partidas,
CUANDO el sábado 14 la jugadora elimina «Hades» y confirma,
ENTONCES no queda ninguna de sus metas, ni activas ni inactivas, ni ninguna de sus partidas, y buscar cualquiera de esas metas indica que no existe.

**CA-10.2 · No afecta a otros juegos** (R-21)
DADO que «Celeste» tiene una meta activa y 3 partidas,
CUANDO se elimina «Hades»,
ENTONCES «Celeste» conserva su meta y sus 3 partidas.

### HU-11 · Partidas válidas (deuda D-10 y D-02)

**CA-11.1 · Partida de hoy con hora posterior** (R-22)
DADO que son las 10:00 del domingo 15,
CUANDO la jugadora registra una partida del domingo 15 a las 18:00 de 60 min,
ENTONCES la partida se registra.

**CA-11.2 · Partida de un día futuro** (R-22)
DADO que son las 10:00 del domingo 15,
CUANDO la jugadora intenta registrar una partida del lunes 16 a las 09:00,
ENTONCES la partida no se registra y un mensaje indica que no puede ser de un día posterior a hoy.

**CA-11.3 · Fecha sin hora** (R-22)
DADO que son las 10:00 del domingo 15,
CUANDO se intenta registrar una partida con fecha «10 de noviembre» sin hora,
ENTONCES la partida no se registra y un mensaje indica que la fecha debe incluir la hora.

**CA-11.4 · Duración de 5 a 1440 minutos** (R-22)
DADO que son las 10:00 del domingo 15,
CUANDO se intenta registrar partidas del sábado 14 de 3, 5, 1440, 1441 y 3000 min,
ENTONCES se registran las de 5 y 1440 min, y las de 3, 1441 y 3000 min se rechazan con un mensaje sobre el rango de duración.

**CA-11.5 · Las partidas ya guardadas se conservan** (R-22, S-02)
DADO que existe una partida antigua del martes 10 de 3 min,
CUANDO la jugadora consulta el progreso el miércoles 11,
ENTONCES esa partida sigue contando para las horas, los días y la racha.

### HU-12 · Avance actual fiable (deuda D-03)

**CA-12.1 · Se ignora una partida sin avance** (R-18)
DADO que hay una partida del martes 10 con avance 60 %, una partida antigua del jueves 12 sin avance y un hito de 50 %,
CUANDO la jugadora consulta el resumen y el progreso el viernes 13,
ENTONCES el avance actual es 60 % y el hito de 50 % está alcanzado.

**CA-12.2 · Las partidas nuevas deben indicar el avance** (R-18)
DADO que son las 10:00 del domingo 15,
CUANDO se intenta registrar una partida del domingo 15 de 60 min sin indicar el avance,
ENTONCES la partida no se registra y un mensaje indica que el avance es obligatorio.

**CA-12.3 · Ninguna partida con avance** (R-18)
DADO que «Hades» solo tiene partidas antiguas sin avance,
CUANDO la jugadora consulta el resumen,
ENTONCES el avance actual es 0 % y ningún hito está alcanzado.

### HU-13 · Meta de la semana cumplida

**CA-13.1 · Cumplida** (R-09)
DADO una meta de 5 h y 4 días, y partidas de 90 min el lunes 9, el miércoles 11, el viernes 13 y el domingo 15,
CUANDO la jugadora consulta el progreso el domingo 15 a las 22:00,
ENTONCES ve 6.0 h (100 %), 4 de 4 días y la indicación «meta cumplida».

**CA-13.2 · Horas sí, días no** (R-09)
DADO una meta de 5 h y 4 días, y una sola partida de 300 min el sábado 14,
CUANDO la jugadora consulta el progreso el domingo 15,
ENTONCES ve 5.0 h (100 %), 1 de 4 días y la indicación «meta no cumplida».

**CA-13.3 · Días sí, horas no** (R-09)
DADO una meta de 5 h y 4 días, y partidas de 60 min el lunes 9, el martes 10, el miércoles 11 y el jueves 12,
CUANDO la jugadora consulta el progreso el domingo 15,
ENTONCES ve 4.0 h (80 %), 4 de 4 días y la indicación «meta no cumplida».

**CA-13.4 · Cumplida por redondeo** (R-08, R-09)
DADO una meta de 5 h y 4 días, y 298 min repartidos en 4 días de la semana,
CUANDO la jugadora consulta el progreso,
ENTONCES ve 5.0 h (100 %), 4 de 4 días y la indicación «meta cumplida».

**CA-13.5 · Sin meta no hay indicación** (R-09, R-11)
DADO que «Hades» no tiene meta activa,
CUANDO la jugadora consulta el progreso,
ENTONCES no ve ninguna indicación de meta cumplida o no cumplida.

---

## 3. Tickets

Definition of Done (DoD) **común** a todos los tickets de código:

- Hay una spec en `docs/specs/` que referencia el ticket, commiteada antes que el código.
- Tests pasando (`npm test`) y build sin errores.
- Commit `feat(E2): T-XX ...`, o `fix(deuda): D-XX ...` en la deuda.

La DoD de cada ticket añade lo específico.

| ID   | Tipo     | Descripción                                                                                                                                                                                    | HU                                 | Depende de             | DoD específica                                                                                                                        |
| ---- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| T-01 | backend  | Configurar el test runner en el backend y el script de tests (D-01)                                                                                                                            | todas                              | —                      | Un test de ejemplo pasa; `AGENTS.md` deja de decir «desde T-01»                                                                       |
| T-02 | dominio  | Día y semana en hora de Ecuador a partir de «ahora»; descartar las partidas de días posteriores a hoy (R-01, R-02, R-23)                                                                       | HU-04, HU-05                       | T-01                   | Tests de CA-04.1, CA-04.2, CA-04.8 y CA-04.9 (parte de día), incluida la partida de las 23:30; sin base de datos ni reloj del sistema |
| T-03 | dominio  | Horas de la semana, porcentaje con tope y días jugados (R-03, R-07, R-08, R-10)                                                                                                                | HU-04                              | T-02                   | Tests de CA-04.3 a CA-04.7 y CA-02.4                                                                                                  |
| T-04 | dominio  | Racha actual y mejor racha sobre todo el historial (R-04, R-05, R-06)                                                                                                                          | HU-05                              | T-02                   | Tests de CA-05.1 a CA-05.7                                                                                                            |
| T-05 | dominio  | Hitos ordenados y estado «alcanzado» a partir del avance actual (R-16, R-17)                                                                                                                   | HU-06                              | T-01                   | Tests de CA-06.1 a CA-06.4                                                                                                            |
| T-21 | dominio  | Semana cumplida: horas al 100 % y días objetivo (R-09)                                                                                                                                         | HU-13                              | T-03                   | Tests de CA-13.1 a CA-13.5                                                                                                            |
| T-06 | dominio  | Armar el progreso semanal completo, con los casos sin meta y sin partidas (R-11)                                                                                                               | HU-04 a HU-07, HU-13               | T-03, T-04, T-05, T-21 | Tests de CA-07.1 a CA-07.3 sobre la función que arma el resultado                                                                     |
| T-07 | backend  | Modelo Meta: horas y días enteros dentro de rango (R-12), hitos de 0 a 5, enteros y sin objetivos repetidos (R-16), y una sola meta activa garantizada también en la base de datos (R-13)      | HU-01, HU-02                       | T-01                   | Tests de validación del esquema para CA-01.2, CA-01.4 y CA-01.8                                                                       |
| T-08 | backend  | Manejo centralizado de errores: conflicto (409), incluido el de clave duplicada (D-05); los demás casos siguen respondiendo 400, 404 y 500                                                     | HU-01, HU-03                       | T-01                   | Test del caso de clave duplicada; tabla de errores del README actualizada                                                             |
| T-09 | backend  | Servicio y rutas de Meta: crear, consultar, listar por juego (activa e inactivas), editar la activa, desactivar y reactivar (R-13 a R-15, R-19), con validadores en las actualizaciones (D-08) | HU-01 a HU-03                      | T-07, T-08             | Criterios CA-01.1, CA-01.6, CA-01.7, CA-02.1 a CA-02.3, CA-02.5 y CA-03.1 a CA-03.6 verificados según la spec                         |
| T-10 | backend  | Progreso semanal de un videojuego: el servicio consulta las partidas, la meta y el avance, y llama al dominio; id inválido o juego inexistente (R-01 a R-11, R-23)                             | HU-04 a HU-07, HU-13               | T-06, T-09             | Respuesta igual al contrato de la spec; casos de id inválido e inexistente                                                            |
| T-11 | backend  | Eliminar un videojuego elimina también todas sus metas (R-21, D-06a)                                                                                                                           | HU-10                              | T-07                   | CA-10.1 y CA-10.2 verificados                                                                                                         |
| T-12 | backend  | Pasar un videojuego a completado o abandonado desactiva su meta activa (R-20, D-09)                                                                                                            | HU-09                              | T-09                   | CA-09.1 a CA-09.4 verificados                                                                                                         |
| T-13 | docs     | Pruebas manuales con curl o Thunder Client sobre la API: sin partidas, ≥ 5 partidas con una racha rota, 400, 404 y 409; tabla de resultados con evidencia                                      | HU-01, HU-04 a HU-07, HU-10, HU-13 | T-10, T-11, T-12       | Tabla con petición, resultado esperado y resultado obtenido en la documentación                                                       |
| T-14 | frontend | Servicio de metas en la capa de API del frontend y tipos del progreso                                                                                                                          | HU-01 a HU-07, HU-13               | T-10                   | Las páginas no llaman directamente a la red; build sin errores                                                                        |
| T-15 | frontend | Sección de progreso en el detalle: barra de horas, días, meta cumplida, racha, mejor racha e hitos; estados de carga, error, vacío y sin meta (con invitación)                                 | HU-04 a HU-07, HU-13               | T-14                   | Revisión con DESIGN.md sin desviaciones; CA-07.x y CA-13.x comprobados en la interfaz                                                 |
| T-16 | frontend | Formulario de meta para crear y editar, con sus hitos                                                                                                                                          | HU-01, HU-02                       | T-14                   | Muestra los mensajes de error de CA-01.2, CA-01.4, CA-01.8, CA-01.6, CA-01.7 y CA-02.5                                                |
| T-17 | frontend | Desactivar con confirmación, lista de metas inactivas y reactivar desde ella                                                                                                                   | HU-03                              | T-15                   | Comprobados CA-03.1 a CA-03.6 en la interfaz                                                                                          |
| T-18 | frontend | Refrescar el progreso al registrar o eliminar una partida (D-14) y mostrar las fechas en hora de Ecuador (D-02)                                                                                | HU-08                              | T-15                   | Comprobados CA-08.1 y CA-08.2                                                                                                         |
| T-19 | deuda    | **D-03:** el avance es obligatorio en las partidas nuevas y el resumen toma la partida más reciente que tenga avance (R-18)                                                                    | HU-12, HU-06                       | T-01                   | Tests de CA-12.1 a CA-12.3; formulario y README actualizados                                                                          |
| T-20 | deuda    | **D-10 y D-02:** rechazar partidas sin hora, de días posteriores a hoy o con duración fuera de 5 a 1440 min, en la API y en el formulario (R-22)                                               | HU-11                              | T-01, T-02             | Tests de CA-11.1 a CA-11.5                                                                                                            |

**Orden de ejecución:** T-01 → dominio (T-02 a T-05, T-21, T-06) → modelo y errores (T-07, T-08) → servicios (T-09 a T-12) → pruebas manuales (T-13) → frontend (T-14 a T-18) → deuda (T-19, T-20). T-21 lleva el número siguiente libre para no renumerar; su lugar en el orden lo dan sus dependencias.

---

## 4. Trazabilidad

| Regla          | Historia            | Criterios                                            | Tickets          |
| -------------- | ------------------- | ---------------------------------------------------- | ---------------- |
| R-01           | HU-04, HU-05        | CA-04.1                                              | T-02, T-10       |
| R-02           | HU-04, HU-05        | CA-04.2, CA-05.4                                     | T-02             |
| R-03           | HU-04, HU-05        | CA-04.3, CA-05.6                                     | T-03, T-04       |
| R-04           | HU-05               | CA-05.1, CA-05.6                                     | T-04             |
| R-05           | HU-05               | CA-05.2, CA-05.3, CA-05.4                            | T-04             |
| R-06           | HU-05               | CA-05.3, CA-05.5                                     | T-04             |
| R-07           | HU-04               | CA-04.3, CA-04.4                                     | T-03             |
| R-08           | HU-04, HU-13        | CA-04.4, CA-04.5, CA-04.6, CA-13.4                   | T-03             |
| R-09           | HU-13               | CA-13.1 a CA-13.5                                    | T-21, T-15       |
| R-10           | HU-04, HU-02        | CA-04.7, CA-02.4                                     | T-03, T-10       |
| R-11           | HU-07               | CA-07.1, CA-07.2, CA-07.3, CA-13.5                   | T-06, T-15       |
| R-12           | HU-01, HU-02        | CA-01.1, CA-01.2, CA-02.5                            | T-07, T-09, T-16 |
| R-13           | HU-01, HU-03        | CA-01.6, CA-03.5                                     | T-07, T-08, T-09 |
| R-14           | HU-02               | CA-02.1, CA-02.2, CA-02.3                            | T-09, T-16       |
| R-15           | HU-03, HU-09        | CA-03.1 a CA-03.5, CA-09.4                           | T-09, T-17       |
| R-16           | HU-01, HU-02, HU-06 | CA-01.3, CA-01.4, CA-01.5, CA-01.8, CA-02.5, CA-06.4 | T-05, T-07, T-16 |
| R-17           | HU-06               | CA-06.1, CA-06.2, CA-06.3                            | T-05, T-15       |
| R-18           | HU-12, HU-06        | CA-12.1, CA-12.2, CA-12.3                            | T-19             |
| R-19           | HU-01, HU-03        | CA-01.7, CA-03.6                                     | T-09             |
| R-20           | HU-09               | CA-09.1 a CA-09.4                                    | T-12             |
| R-21           | HU-10               | CA-10.1, CA-10.2                                     | T-11             |
| R-22           | HU-11               | CA-11.1 a CA-11.5                                    | T-20             |
| R-23           | HU-04, HU-05        | CA-04.8, CA-04.9, CA-05.7                            | T-02             |
| Enunciado §7.4 | HU-08               | CA-08.1, CA-08.2                                     | T-18             |

---

## 5. Deuda técnica

### Se pagan en E2

| Problema | Qué se hace                                                                                                                            | Ticket           | Criterios                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------- |
| D-03     | El avance es obligatorio y el resumen ignora las partidas sin avance (R-18)                                                            | T-19             | CA-12.1 a CA-12.3         |
| D-10     | Se rechazan las partidas de días posteriores a hoy y las duraciones fuera de 5 a 1440 min (R-22)                                       | T-20             | CA-11.1, CA-11.2, CA-11.4 |
| D-02     | El día se calcula en hora de Ecuador (T-02), se rechazan las fechas sin hora (T-20) y las fechas se muestran en hora de Ecuador (T-18) | T-02, T-20, T-18 | CA-04.2, CA-04.3, CA-11.3 |

**Bloqueantes resueltos dentro de E2** (no cuentan como deuda pagada): D-01 (T-01), D-05 en su parte del 409 (T-08; los mensajes en bruto se difieren), D-06a (T-11), D-09 (T-12, T-09), D-14 (T-18) y D-08, que es una regla DEBE de la spec, aplicada en T-09.

### Se difieren

| Problema                                                      | Motivo                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-04 · Editar partidas                                        | Es grande (backend e interfaz) y no bloquea la épica: para corregir, se elimina y se registra de nuevo (PRD P-01). Al implementarla habrá que resolver PRD S-07: las partidas antiguas sin avance no podrán volver a guardarse                                       |
| D-05 (parcial) · Mensajes de validación del esquema en bruto  | T-08 resuelve el 409 de D-05, pero los mensajes de validación siguen saliendo con el prefijo técnico («Meta validation failed: …»). Aun así incluyen el campo y la regla, así que los criterios se cumplen; limpiarlos cambiaría los mensajes de E1 y no aporta a E2 |
| D-06b · Eliminación sin transacción                           | El riesgo es bajo; las transacciones exigen un _replica set_ y complican el despliegue (PRD P-02)                                                                                                                                                                    |
| D-07 · Validaciones repartidas en capas                       | No es un defecto: se fija la convención en `AGENTS.md` y en la spec, sin reescribir lo que ya existe                                                                                                                                                                 |
| D-11 · Falta un índice por videojuego y fecha en las partidas | Con el volumen de uso personal (PRD S-05) no afecta al rendimiento                                                                                                                                                                                                   |
| D-12 · Detalles del README                                    | Es documentación final: se corrige en la fase 9                                                                                                                                                                                                                      |
| D-13 · Bootstrap global                                       | Ya está decidido en `DESIGN.md` (base CSS con límites); las desviaciones existentes se corrigen al tocar cada archivo                                                                                                                                                |
