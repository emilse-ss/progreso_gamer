// Dominio: racha actual y mejor racha sobre todo el historial (R-04, R-05, R-06).
import {
  diaEcuador,
  partidasHastaHoy,
  sumarDias,
  type PartidaDominio,
} from "./fechas";

export interface Rachas {
  rachaActual: number;
  mejorRacha: number;
}

/**
 * Días consecutivos con al menos una partida. La racha actual sigue viva si hoy
 * todavía no hay partida pero ayer sí (R-05). Se ignoran las partidas de días
 * posteriores a hoy (R-23).
 */
export function rachas(partidas: PartidaDominio[], ahora: Date): Rachas {
  const dias = new Set(
    partidasHastaHoy(partidas, ahora).map((partida) =>
      diaEcuador(partida.fecha),
    ),
  );

  let mejorRacha = 0;
  let longitud = 0;
  let anterior: string | null = null;
  for (const dia of [...dias].sort()) {
    longitud =
      anterior !== null && sumarDias(anterior, 1) === dia ? longitud + 1 : 1;
    mejorRacha = Math.max(mejorRacha, longitud);
    anterior = dia;
  }

  const hoy = diaEcuador(ahora);
  const ayer = sumarDias(hoy, -1);
  let dia: string | null = dias.has(hoy) ? hoy : dias.has(ayer) ? ayer : null;
  let rachaActual = 0;
  while (dia !== null && dias.has(dia)) {
    rachaActual += 1;
    dia = sumarDias(dia, -1);
  }

  return { rachaActual, mejorRacha };
}
