// Dominio: día y semana en hora de Ecuador (R-01, R-02, R-23).
// Funciones puras: no importan Mongoose ni Express y no leen el reloj del sistema.

/** Día del calendario en America/Guayaquil, con formato "YYYY-MM-DD". */
export type Dia = string;

export interface Semana {
  inicio: Dia;
  fin: Dia;
}

export interface PartidaDominio {
  fecha: Date;
  duracionMinutos: number;
}

const ZONA_HORARIA_NEGOCIO = "America/Guayaquil";

const formatoDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA_NEGOCIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Día de Ecuador al que pertenece un instante (R-02). */
export function diaEcuador(instante: Date): Dia {
  const partes = formatoDia.formatToParts(instante);
  const valor = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

function aFechaUtc(dia: Dia): Date {
  const [anio, mes, diaDelMes] = dia.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, diaDelMes));
}

/** Suma (o resta, con n negativo) días del calendario a un día. */
export function sumarDias(dia: Dia, n: number): Dia {
  const fecha = aFechaUtc(dia);
  fecha.setUTCDate(fecha.getUTCDate() + n);
  return fecha.toISOString().slice(0, 10);
}

/** Semana de lunes a domingo, en hora de Ecuador, que contiene a `ahora` (R-01). */
export function semanaDe(ahora: Date): Semana {
  const hoy = diaEcuador(ahora);
  const diasDesdeLunes = (aFechaUtc(hoy).getUTCDay() + 6) % 7;
  const inicio = sumarDias(hoy, -diasDesdeLunes);
  return { inicio, fin: sumarDias(inicio, 6) };
}

/**
 * Descarta las partidas de días posteriores a hoy en Ecuador; conserva las de hoy
 * aunque su hora sea posterior a `ahora` (R-23).
 */
export function partidasHastaHoy<T extends PartidaDominio>(
  partidas: T[],
  ahora: Date,
): T[] {
  const hoy = diaEcuador(ahora);
  return partidas.filter((partida) => diaEcuador(partida.fecha) <= hoy);
}
