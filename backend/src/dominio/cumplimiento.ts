// Dominio: meta de la semana cumplida (R-09).
import type { HitoDominio } from "./hitos";

export interface MetaDominio {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: HitoDominio[];
}

/** La meta se cumple al llegar al 100 % de las horas y a los días objetivo (R-09). */
export function metaCumplida(
  meta: MetaDominio,
  porcentajeHoras: number,
  diasJugadosSemana: number
): boolean {
  return porcentajeHoras >= 100 && diasJugadosSemana >= meta.diasPorSemana;
}
