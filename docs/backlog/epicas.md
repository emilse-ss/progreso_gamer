# Épicas · Diario de Progreso Gamer

> Qué cubre cada épica. Las reglas `R-XX` están en `docs/prd/PRD.md`. Las historias, criterios y tickets de E2 están en `E2-metas-y-rachas.md`.

## E1 · Registro de videojuegos y partidas (Proyecto 3, existente)

**Objetivo:** responder «¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?».

**Alcance cubierto:**

- **Videojuegos:** registrar, consultar, editar y eliminar; filtrar la lista por plataforma, género y estado (jugando, pausado, completado o abandonado).
- **Logros de cada videojuego:** agregar, editar, marcar y eliminar.
- **Partidas:** registrar (fecha, duración, avance y notas), listar todas y eliminar.
- **Resumen de cada videojuego:** total de partidas, horas totales, fecha de la última partida y avance actual.
- **Eliminar un videojuego** elimina también sus partidas.
- **Interfaz:** lista con filtros, detalle con resumen y logros, formularios de videojuego y de partida, lista global de partidas con confirmación de borrado, y página «no encontrado».

**Cambios que E2 introduce en E1** (pago de deuda del diagnóstico):

- El avance actual ignora las partidas sin avance, y las partidas nuevas deben indicarlo (R-18, D-03).
- Las partidas nuevas deben tener hora, no pueden ser posteriores a hoy y deben durar de 5 a 1440 minutos (R-22; D-02, D-10).
- Marcar un videojuego como completado o abandonado desactiva su meta activa (R-20, D-09).
- Eliminar un videojuego elimina también sus metas (R-21, D-06a).

**Fuera de alcance (deuda diferida):** editar partidas (D-04, P-01).

## E2 · Metas y rachas (nueva)

**Objetivo:** responder «¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?».

**Métrica de éxito:** la persona cumple su meta semanal al menos 3 de 4 semanas en un mes (PRD §3; se mide fuera de la aplicación).

**Alcance:**

- **Meta semanal por videojuego:** horas por semana, días por semana y de 0 a 5 hitos de avance (R-12, R-16).
  - Como máximo una meta activa por videojuego (R-13).
  - Se crea, se edita solo si está activa, se desactiva y se reactiva; nunca se borra (R-14, R-15).
  - Un videojuego completado o abandonado no puede tener meta activa (R-19, R-20).
- **Progreso de la semana actual** en el detalle del videojuego (R-01 a R-11, R-23):
  - Horas jugadas frente a la meta, con su porcentaje (tope en 100 %).
  - Días jugados frente a los días objetivo.
  - Racha actual y mejor racha.
  - Estado de cada hito: alcanzado o no (R-17, R-18).
- **Estados de la sección de progreso:** cargando, error, sin partidas y sin meta activa. Este último invita a crear una meta.
- **Actualización:** el progreso se vuelve a consultar al registrar o eliminar una partida.

**No-alcance:** notificaciones, recordatorios, metas compartidas, rankings, gráficos históricos, consulta de semanas pasadas y borrado de metas (PRD §5).

**Dependencias:** el día y la semana en hora de Ecuador (D-02) y la existencia de pruebas automáticas (D-01) son requisitos previos para calcular y verificar el progreso.
