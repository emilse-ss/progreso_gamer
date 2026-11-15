# AGENTS.md · Diario de Progreso Gamer

Registro de videojuegos, partidas y logros (épica E1). Épica en curso: **E2 · Metas y rachas** (meta semanal, racha, hitos).
Plan de trabajo y mapa de documentos: [docs/PLAN-E2.md](docs/PLAN-E2.md). Estado y deuda: [docs/diagnostico.md](docs/diagnostico.md).

## Stack

- Backend: Node ≥ 20, Express 4, TypeScript (CommonJS), Mongoose 8 sobre MongoDB Atlas.
- Frontend: React 18, Vite 6, TypeScript, React Router 6, CSS propio con variables (+ Bootstrap limitado, ver DESIGN.md).
- Despliegue: Render (Web Service + Static Site). Formato: Prettier (raíz). Tests: Vitest (desde T-01).

## Estructura

```text
backend/src/   config/ controllers/ errors/ middlewares/ modelos/ routes/ services/ dominio/ (nueva, E2)
frontend/src/  api/ components/ (ui/, iconos/) estilos/ paginas/
docs/          contexto/ diagnostico.md PLAN-E2.md prd/ backlog/ specs/
.claude/       skills/ (nueva-spec, commit) · hooks/ · settings.json
```

## Comandos

- Dev: `npm run dev` (en `backend/` y en `frontend/`).
- Build: `npm run build` (en cada paquete).
- Test: `npm test` (Vitest, desde T-01); hasta entonces, verificar con `npm run build`.
- Formato: `npm run format -- <archivos>` en la raíz. No reformatear el repositorio entero.

## Reglas

1. **Nunca** leer ni modificar `.env` (sí `.env.example`, sin credenciales reales). Un hook lo bloquea.
2. Ninguna funcionalidad sin una spec en `docs/specs/`. Si falta una decisión, preguntar; no improvisar.
3. Ejecutar los tests (o el build mientras no existan) antes de dar una tarea por terminada.
4. Semana, días jugados, racha e hitos: funciones puras en `backend/src/dominio/`, sin base de datos, sin Mongoose/Express y sin `Date.now()`: reciben `ahora` por parámetro.
5. Zona horaria de negocio: `America/Guayaquil` (con `Intl`, sin dependencias nuevas).
6. Validaciones (D-07): forma del cuerpo en el controlador; existencia de referencias, unicidad y reglas de negocio en el servicio; rangos en el esquema.
7. Actualizaciones con `runValidators: true` (D-08).
8. Errores: 400, 404, 409 y 500 vía `errorHandler`; los servicios lanzan `ApiError`.
9. No agregar dependencias que la spec no autorice.
10. Commits: `feat(E2): T-XX descripción`. La spec se commitea antes que su código. Revisar `git diff` y que no entre ningún `.env`.
11. Los IDs (`D-XX`, `R-XX`, `HU-XX`, `CA-XX.Y`, `T-XX`) son estables: no se renumeran ni se reutilizan.
12. Las decisiones de negocio son de la estudiante: proponer opciones, no decidir.

## Convenciones

- Código e identificadores en español (`videojuego.service.ts`, `Partida.model.ts`), un archivo por recurso y capa.
- Flujo: ruta → controlador → servicio → modelo. El servicio de progreso consulta y llama al dominio.
- Frontend: llamadas HTTP solo en `src/api/*Api.ts` sobre `httpClient.ts`; las páginas no usan `fetch`.

## Frontend

Antes de tocar la interfaz, leer **[DESIGN.md](DESIGN.md)**: colores, tipografía, componentes, tono, accesibilidad y qué no se hace.
