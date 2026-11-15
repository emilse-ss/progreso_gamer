// Dominio: horas, días jugados y porcentaje de la semana (R-03, R-07, R-08, R-10).
import { diaEcuador, type PartidaDominio, type Semana } from "./fechas";

export interface HorasYDias {
  horasSemana: number;
  diasJugadosSemana: number;
}

/**
 * Suma las horas (redondeadas a un decimal) y cuenta los días distintos con al menos
 * una partida dentro de la semana. Cada partida cuenta entera en el día en que empieza.
 */
export function horasYDiasSemana(
  partidas: PartidaDominio[],
  semana: Semana,
): HorasYDias {
  let minutos = 0;
  const dias = new Set<string>();

  for (const partida of partidas) {
    const dia = diaEcuador(partida.fecha);
    if (dia >= semana.inicio && dia <= semana.fin) {
      minutos += partida.duracionMinutos;
      dias.add(dia);
    }
  }

  // minutos / 6 = décimas de hora; redondear ahí evita errores de coma flotante.
  return {
    horasSemana: Math.round(minutos / 6) / 10,
    diasJugadosSemana: dias.size,
  };
}

/** Porcentaje entero de las horas jugadas frente a la meta, con tope en 100 (R-08). */
export function porcentajeHoras(
  horasSemana: number,
  horasSemanales: number,
): number {
  return Math.min(100, Math.round((horasSemana / horasSemanales) * 100));
}
