import { describe, expect, it } from "vitest";
import { fechaConHoraYZona, validarPartidaNueva } from "./partida";

// Domingo 15 de noviembre de 2026 a las 10:00 en Ecuador.
const ahora = new Date("2026-11-15T10:00:00-05:00");
const partida = (fecha: string, duracionMinutos = 60) => ({
  fecha: new Date(fecha),
  duracionMinutos
});

describe("dominio/partida", () => {
  it("CA-11.1 hoy con hora posterior: una partida de hoy a las 18:00 es válida", () => {
    expect(validarPartidaNueva(partida("2026-11-15T18:00:00-05:00"), ahora)).toBeNull();
  });

  it("CA-11.2 día futuro: una partida del lunes 16 se rechaza", () => {
    expect(validarPartidaNueva(partida("2026-11-16T09:00:00-05:00"), ahora)).toBe(
      "La fecha no puede ser de un día posterior a hoy (hora de Ecuador)"
    );
  });

  it("CA-11.2 el límite es el fin del día de hoy en Ecuador, no en UTC", () => {
    // 23:59 del domingo 15 en Ecuador: hoy.
    expect(validarPartidaNueva(partida("2026-11-15T23:59:00-05:00"), ahora)).toBeNull();
    // 03:00Z del lunes 16 son las 22:00 del domingo 15 en Ecuador: hoy.
    expect(validarPartidaNueva(partida("2026-11-16T03:00:00Z"), ahora)).toBeNull();
    // 00:00 del lunes 16 en Ecuador: mañana.
    expect(validarPartidaNueva(partida("2026-11-16T00:00:00-05:00"), ahora)).not.toBeNull();
  });

  it("CA-11.3 fecha sin hora: solo se aceptan fechas ISO con hora y zona", () => {
    expect(fechaConHoraYZona("2026-11-10")).toBe(false);
    expect(fechaConHoraYZona("2026-11-15T10:00")).toBe(false);
    expect(fechaConHoraYZona("10 de noviembre")).toBe(false);
    expect(fechaConHoraYZona("2026-13-40T10:00:00Z")).toBe(false);
    expect(fechaConHoraYZona("2026-11-14T23:30:00-05:00")).toBe(true);
    expect(fechaConHoraYZona("2026-11-15T04:30:00.000Z")).toBe(true);
    expect(fechaConHoraYZona("2026-11-15T10:00-05:00")).toBe(true);
  });

  it("CA-11.4 duración de 5 a 1440 minutos", () => {
    const deAyer = (min: number) =>
      validarPartidaNueva(partida("2026-11-14T08:00:00-05:00", min), ahora);
    for (const min of [3, 1441, 3000]) {
      expect(deAyer(min)).toBe("duracionMinutos debe estar entre 5 y 1440");
    }
    expect(deAyer(5)).toBeNull();
    expect(deAyer(1440)).toBeNull();
  });
});
