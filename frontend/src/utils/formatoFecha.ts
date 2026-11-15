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

const formatoFechaCorta = new Intl.DateTimeFormat('es-EC', {
  timeZone: ZONA_HORARIA,
  day: 'numeric',
  month: 'short',
});

/** Día de un instante ISO en hora de Ecuador: «13 nov». */
export function formatearFechaCorta(instante: string): string {
  const fecha = new Date(instante);
  return Number.isNaN(fecha.getTime())
    ? 'fecha no disponible'
    : formatoFechaCorta.format(fecha);
}

const formatoFechaHora = new Intl.DateTimeFormat('es-EC', {
  timeZone: ZONA_HORARIA,
  dateStyle: 'medium',
  timeStyle: 'short',
});

/**
 * Fecha y hora de un instante ISO en hora de Ecuador, sea cual sea la zona del navegador.
 * Sustituye a los formatDate de las páginas, que usaban la zona del navegador (D-02).
 */
export function formatearFechaHora(
  instante: string | null,
  sinValor = 'Sin partidas registradas',
): string {
  if (!instante) return sinValor;
  const fecha = new Date(instante);
  return Number.isNaN(fecha.getTime())
    ? 'Fecha no disponible'
    : formatoFechaHora.format(fecha);
}

/** «9 nov al 15 nov» para la semana del progreso. */
export function formatearRangoSemana(inicio: string, fin: string): string {
  return `${formatearDia(inicio)} al ${formatearDia(fin)}`;
}

export { ZONA_HORARIA };
