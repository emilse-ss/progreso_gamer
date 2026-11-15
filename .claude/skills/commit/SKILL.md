---
name: commit
description: Revisa git status y git diff, propone un mensaje con el formato de AGENTS.md y hace el commit solo tras la confirmación de la estudiante.
disable-model-invocation: true
argument-hint: [pista opcional del mensaje o del ticket, p. ej. T-03]
---

# /commit

## Pasos

1. Ejecuta `git status --short` y `git branch --show-current`. Si la rama es `main`, avisa y detente.
2. **Comprobación de `.env` (obligatoria).** Revisa los archivos preparados y los que propones añadir:
   `git diff --cached --name-only` y `git status --porcelain`. Si alguna ruta termina en `.env` o `.env.<algo>` distinto de `.env.example`, **detente**, avisa y no hagas commit. No abras el archivo para comprobarlo.
3. Revisa el contenido con `git diff` y `git diff --cached`. Resume en 3 a 6 viñetas qué cambia. Señala lo que parezca no intencionado: reformateos masivos, archivos ajenos a la tarea o `console.log` sueltos.
4. Elige el tipo de mensaje según `AGENTS.md` y `docs/PLAN-E2.md`:
   - Implementación: `feat(E2): T-XX <descripción>`.
   - Deuda técnica: `fix(deuda): D-XX <descripción>`.
   - Documentación por fase: `docs(diagnostico|prd|backlog|spec|auditoria): ...`. Harness: `chore(harness): ...`.
   - Si el código implementa un ticket, comprueba con `git log --oneline -- docs/specs/` que su spec ya está commiteada. Si no lo está, avisa: la spec va primero.
5. Propón: (a) la lista exacta de archivos que vas a añadir (por nombre, nunca `git add -A` ni `git add .`) y (b) el mensaje completo.
6. **Espera la confirmación explícita.** Si la estudiante cambia algo, vuelve a proponer.
7. Solo tras el «sí»: `git add <archivos>` y `git commit -m "<mensaje>"`. Luego muestra `git log --oneline -1` y `git status --short`.

## Nunca

- Hacer commit, `push`, `--amend` ni `--no-verify` sin una petición explícita.
- Añadir archivos `.env` ni leer su contenido.
