# Bitácora del agente · E2 «Metas y rachas»

> Momentos clave del trabajo con el agente (Claude Code): qué se pidió, qué hizo bien o mal y cómo se corrigió. Se escribe cuando ocurre el momento, no al final (`docs/PLAN-E2.md` §7, regla 7). El enunciado pide de 5 a 8 entradas, y al menos una debe ser una desviación de la spec detectada.

| #   | Fase        | Tipo                            |
| --- | ----------- | ------------------------------- |
| 1   | 6 · Backend | Desviación de la spec detectada |

---

## 1. Tests que pasaron sin haber fallado por comportamiento, y archivos fuera de la spec

- **Fecha:** 15 de noviembre de 2026
- **Fase y tickets:** 6 · Backend, T-02 a T-12
- **Tipo:** desviación de la spec detectada

**Qué se pidió.** Implementar cada ticket con los tests primero, en rojo, y después el código. Respetar la tabla ticket → archivos de `docs/specs/E2-backend-metas-progreso.md`. Al cerrar la fase, la estudiante preguntó si en algún momento el agente se había desviado de la spec: si había añadido campos o endpoints, cambiado el formato de una respuesta, usado `Date.now()` en el dominio o escrito un test que pasara sin haber fallado.

**Qué hizo el agente.**

- **Bien:** no añadió campos ni endpoints fuera de la spec, no cambió el formato de las respuestas (`metaCumplida` y `requestId` estaban aprobados en D-T03) y el dominio no lee el reloj (la búsqueda de NO-DEBE-1 da cero coincidencias). Los 55 tests unitarios y las 61 pruebas de API pasan.
- **Mal (desviaciones reconocidas por el propio agente cuando se le preguntó):**
  1. **El rojo fue solo de import:** en T-02 a T-07 los tests fallaron únicamente por «`Cannot find module`», porque el archivo aún no existía. Ninguno falló en su aserción, así que no hay evidencia de que detecten una implementación equivocada.
  2. **Tests de regresión, no de TDD:** en T-08, cinco de los seis tests del `errorHandler` pasaron desde el principio, porque prueban comportamiento que ya existía. Solo el de E11000 → 409 estuvo en rojo.
  3. **Pruebas de API escritas después del código:** en T-09, T-10 y T-11 las pruebas con curl se escribieron y ejecutaron después de implementar. Nunca se vieron en rojo. Solo T-12 siguió el ciclo: 1 de 5 antes del código y 5 de 5 después.
  4. **Archivo fuera de la tabla de la spec:** en T-12 se modificó `meta.service.ts`, para exportar `ESTADOS_SIN_META_ACTIVA` y no duplicar la regla de R-19. La spec solo listaba `videojuego.service.ts`.
  5. **Orden distinto al de §3.5:** en T-10, el servicio llama primero a `obtenerResumen` para validar el id y la existencia del juego, en lugar de validar primero y llamar al resumen al final. Los códigos y mensajes son los mismos.
  6. **Matiz en §3.4:** en T-12 la meta se desactiva si el estado _resultante_ es `completado` o `abandonado`, no solo cuando el estado _pasa_ a uno de ellos.

**Cómo se corrigió.**

- La desviación se detectó en una revisión que pidió la estudiante al cerrar la fase 6, antes de pasar al frontend.
- El agente propuso tres correcciones:
  - Mutar el código a propósito en tres casos (quitar el tope de 100 %, hacer que la racha empiece solo desde hoy, quitar la cascada a las metas) para comprobar que los tests fallan.
  - Actualizar la spec con `meta.service.ts` y el orden real de los pasos.
  - Registrar el momento en esta bitácora.
- **Decisión de la estudiante:** solo registrarlo. Las desviaciones 4 a 6 no cambian el comportamiento observable. Las 1 a 3 quedan como riesgo conocido de los tests.
- **Regla para las fases siguientes:** cada test debe verse fallar **en su aserción**, no solo por un import que falta, antes de escribir el código. En los tickets de API, la prueba con curl se ejecuta antes de implementar.
