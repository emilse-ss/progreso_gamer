---
name: nueva-spec
description: Crea una spec nueva en docs/specs/ a partir de la plantilla del proyecto (objetivo, reglas DEBE / NO DEBE, contrato, criterio → verificación, ticket → archivos).
disable-model-invocation: true
argument-hint: <nombre-de-la-spec> (p. ej. backend-metas-progreso)
---

# /nueva-spec

Crea `docs/specs/$ARGUMENTS.md` con la plantilla de abajo.

## Pasos

1. Si `$ARGUMENTS` está vacío, pide un nombre en kebab-case y detente.
2. Si `docs/specs/$ARGUMENTS.md` ya existe, **no lo sobrescribas**: avisa y detente.
3. Lee `docs/backlog/E2-metas-y-rachas.md` (si existe) y pregunta qué historias (`HU-XX`), criterios (`CA-XX.Y`) y tickets (`T-XX`) cubre la spec. Usa los IDs tal cual: no los inventes ni los renumeres.
4. Crea el archivo con la plantilla. Rellena solo lo que salga del backlog y del PRD. Lo que falte se marca `PENDIENTE: …`; no lo inventes.
5. Muestra la ruta creada y la lista de `PENDIENTE`. **No hagas commit**: para eso está `/commit`, y la spec debe commitearse antes que su código.

## Plantilla

```markdown
# Spec · <título>

- **Épica:** E2 · Metas y rachas
- **Historias:** HU-XX, HU-YY
- **Tickets:** T-XX, T-YY
- **Estado:** borrador

## 1. Objetivo

<Qué resuelve esta spec y para quién, en 2 o 3 frases. Remite a las reglas R-XX del PRD.>

## 2. Reglas

### DEBE

- **DEBE-1:** <regla verificable> (R-XX)

### NO DEBE

- **NO-DEBE-1:** <lo que queda prohibido o fuera de alcance>

## 3. Contrato

<Backend: método, ruta, cuerpo, respuestas (200/201, 400, 404, 409, 500) con un ejemplo JSON.
Frontend: componentes, props, estados (carga, error, vacío) y llamadas a `src/api/*Api.ts`.
Dominio: firma de cada función pura, que recibe `ahora` por parámetro.>

## 4. Criterio → verificación

| Criterio | Verificación                                                                | Tipo                 |
| -------- | --------------------------------------------------------------------------- | -------------------- |
| CA-XX.Y  | <test `CA-XX.Y …` en `archivo.test.ts`, o curl / revisión manual con pasos> | test / curl / manual |

## 5. Ticket → archivos

| Ticket | Archivos (crear / modificar) | Depende de |
| ------ | ---------------------------- | ---------- |
| T-XX   | `backend/src/...`            | —          |

## 6. Puntos abiertos

- PENDIENTE: …
```
