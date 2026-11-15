# Bitácora del agente · E2 «Metas y rachas»

> Momentos clave del trabajo con el agente (Claude Code): qué se pidió, qué hizo bien o mal y cómo se corrigió. Se escribe cuando ocurre el momento, no al final (`docs/PLAN-E2.md` §7, regla 7). El enunciado pide de 5 a 8 entradas, y al menos una debe ser una desviación de la spec detectada.

| #   | Fase        | Tipo                                               |
| --- | ----------- | -------------------------------------------------- |
| 1   | 6 · Backend | Desviación de la spec detectada                    |
| 2   | 8 · Deuda   | Error del agente detectado en la revisión del diff |

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

---

## 2. Un `$$this` que se convirtió en `$this`, y un test que no puede verse rojo

- **Fecha:** 15 de noviembre de 2026
- **Fase y tickets:** 8 · Deuda técnica, T-19 y T-20
- **Tipo:** error del agente detectado en la revisión del diff

**Qué se pidió.** Pagar D-03 (T-19) y D-10 con D-02 (T-20) siguiendo la regla de la fase 6: curl en rojo antes del código y cada test visto fallar en su aserción.

**Qué hizo el agente.**

- **Bien:** el ciclo se cumplió.
  - El curl se ejecutó antes del código: CA-12.1 dio 0 y CA-12.2 dio 201; CA-11.2, CA-11.3 y CA-11.4 dieron 201.
  - El test de CA-12.2 falló en `expected [] to include 'porcentajeAvance'`.
  - Para T-20, el agente creó primero un _stub_ de `dominio/partida.ts` con las firmas y valores neutros. Así los cuatro tests de CA-11.2 a CA-11.4 fallaron en su aserción y no en el import.
- **Mal:** el agente editó `videojuego.service.ts` con un script de `node` que usaba `String.replace`. En el texto de reemplazo, `$$` equivale a un solo `$`, así que la variable `"$$this"` del `$filter` quedó escrita como `"$this"`. Mongo habría leído `"$this"` como un campo llamado `this`, inexistente: el filtro habría descartado todos los avances y el resumen habría devuelto 0 siempre. Era justo el defecto que T-19 debía corregir. TypeScript y los tests unitarios no lo detectan, porque el aggregate no tiene test sin base de datos.
- **Límite reconocido:** CA-11.5 («las partidas antiguas se conservan») ya tenía un test en verde (`progreso.test.ts`) y no puede verse rojo, porque protege un comportamiento que no cambia. Se verificó con datos reales: las partidas inválidas creadas en el rojo siguen guardadas y cuentan en el progreso.

**Cómo se corrigió.**

- El agente detectó el error al revisar el `git diff` antes de ejecutar nada, y lo corrigió con un reemplazo sin patrones (`split` y `join`).
- El curl en verde de CA-12.1 (avance 60, hito de 50 alcanzado) confirma que el filtro funciona.
- **Regla añadida:** en los scripts de edición, los reemplazos son literales (`split`/`join`) o usan una función. Nunca un texto de reemplazo con `$`.
