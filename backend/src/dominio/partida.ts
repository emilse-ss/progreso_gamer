// Dominio: reglas de una partida nueva (R-22, D-10 y D-02).
// Funciones puras: no importan Mongoose ni Express y no leen el reloj; reciben `ahora`.
import { diaEcuador } from "./fechas";

export const DURACION_MINIMA = 5;
export const DURACION_MAXIMA = 1440;

// Fecha ISO con hora obligatoria y zona explícita (Z o ±hh:mm); los segundos son opcionales.
const ISO_CON_HORA_Y_ZONA =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/** true si el texto trae fecha, hora y zona; "2026-11-10" (sin hora) da false (CA-11.3). */
export function fechaConHoraYZona(texto: string): boolean {
  return ISO_CON_HORA_Y_ZONA.test(texto) && !Number.isNaN(Date.parse(texto));
}

/**
 * Valida una partida nueva frente a `ahora`. Devuelve el mensaje de error o null.
 * Se aceptan las de hoy aunque su hora sea posterior a `ahora` (CA-11.1); se rechazan las de
 * un día posterior a hoy en Ecuador (CA-11.2) y las que duran menos de 5 o más de 1440 min (CA-11.4).
 */
export function validarPartidaNueva(
  entrada: { fecha: Date; duracionMinutos: number },
  ahora: Date
): string | null {
  if (diaEcuador(entrada.fecha) > diaEcuador(ahora)) {
    return "La fecha no puede ser de un día posterior a hoy (hora de Ecuador)";
  }
  if (entrada.duracionMinutos < DURACION_MINIMA || entrada.duracionMinutos > DURACION_MAXIMA) {
    return `duracionMinutos debe estar entre ${DURACION_MINIMA} y ${DURACION_MAXIMA}`;
  }
  return null;
}
