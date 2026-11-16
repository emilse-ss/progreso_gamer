import { calcularProgresoSemanal, type ProgresoSemanal } from "../dominio/progreso";
import Meta from "../modelos/Meta.model";
import Partida from "../modelos/Partida.model";
import { obtenerResumen } from "./videojuego.service";

/**
 * Progreso de la semana actual de un videojuego. El servicio solo consulta los datos;
 * todo el cálculo lo hace el dominio (DEBE-1). Es el único punto del flujo que lee el
 * reloj, y pasa ese instante al dominio como `ahora` (DEBE-3).
 */
export async function obtenerProgresoSemanal(videojuegoId: string): Promise<ProgresoSemanal> {
  // obtenerResumen valida el formato del id (400) y la existencia del videojuego (404), y
  // aporta el avance actual del juego (DEBE-10).
  const { porcentajeAvanceActual } = await obtenerResumen(videojuegoId);

  const [partidas, meta] = await Promise.all([
    Partida.find({ videojuego: videojuegoId }).select("fecha duracionMinutos").lean(),
    Meta.findOne({ videojuego: videojuegoId, activa: true }).lean()
  ]);

  return calcularProgresoSemanal({
    partidas: partidas.map(({ fecha, duracionMinutos }) => ({ fecha, duracionMinutos })),
    // Solo los datos de la meta que usa el cálculo; nunca sus fechas (NO-DEBE-3).
    meta: meta
      ? {
          horasSemanales: meta.horasSemanales,
          diasPorSemana: meta.diasPorSemana,
          hitos: meta.hitos.map(({ descripcion, porcentajeObjetivo }) => ({
            descripcion,
            porcentajeObjetivo
          }))
        }
      : null,
    avanceActual: porcentajeAvanceActual,
    ahora: new Date()
  });
}
