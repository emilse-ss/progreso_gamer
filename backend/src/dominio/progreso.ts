// Dominio: progreso semanal completo (R-01 a R-11, R-23).
// Compone las funciones puras del dominio; no consulta datos ni lee el reloj.
import { metaCumplida, type MetaDominio } from "./cumplimiento";
import { partidasHastaHoy, semanaDe, type PartidaDominio, type Semana } from "./fechas";
import { evaluarHitos, type HitoEvaluado } from "./hitos";
import { rachas } from "./racha";
import { horasYDiasSemana, porcentajeHoras } from "./semana";

export interface EntradaProgreso {
  partidas: PartidaDominio[];
  /** Meta activa en el momento de la consulta, o null si no hay (R-10, R-11). */
  meta: MetaDominio | null;
  /** porcentajeAvanceActual del resumen del videojuego (R-17, R-18). */
  avanceActual: number;
  ahora: Date;
}

export interface ProgresoSemanal {
  semana: Semana;
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoEvaluado[];
  metaCumplida: boolean | null;
}

export function calcularProgresoSemanal({
  partidas,
  meta,
  avanceActual,
  ahora
}: EntradaProgreso): ProgresoSemanal {
  const semana = semanaDe(ahora);
  const { horasSemana, diasJugadosSemana } = horasYDiasSemana(
    partidasHastaHoy(partidas, ahora),
    semana
  );
  const { rachaActual, mejorRacha } = rachas(partidas, ahora);

  if (meta === null) {
    return {
      semana,
      meta: null,
      horasSemana,
      porcentajeHoras: null,
      diasJugadosSemana,
      rachaActual,
      mejorRacha,
      hitos: [],
      metaCumplida: null
    };
  }

  const porcentaje = porcentajeHoras(horasSemana, meta.horasSemanales);
  return {
    semana,
    meta: {
      horasSemanales: meta.horasSemanales,
      diasPorSemana: meta.diasPorSemana
    },
    horasSemana,
    porcentajeHoras: porcentaje,
    diasJugadosSemana,
    rachaActual,
    mejorRacha,
    hitos: evaluarHitos(meta.hitos, avanceActual),
    metaCumplida: metaCumplida(meta, porcentaje, diasJugadosSemana)
  };
}
