// Formato de fechas en hora de Ecuador (D-02, DEBE-12 de la spec de frontend).

const ZONA_HORARIA = 'America/Guayaquil';

const formatoDiaCorto = new Intl.DateTimeFormat('es-EC', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

/**
 * Formatea un día "YYYY-MM-DD" de la API sin convertirlo a un instante local:
 * se construye a mediodía UTC y se formatea en UTC, así nunca se desplaza al día anterior.
 */
export function formatearDia(dia: string): string {
  const [anio, mes, diaDelMes] = dia.split('-').map(Number);
  return formatoDiaCorto.format(
    new Date(Date.UTC(anio, mes - 1, diaDelMes, 12)),
  );
}

/** «9 nov al 15 nov» para la semana del progreso. */
export function formatearRangoSemana(inicio: string, fin: string): string {
  return `${formatearDia(inicio)} al ${formatearDia(fin)}`;
}

export { ZONA_HORARIA };
