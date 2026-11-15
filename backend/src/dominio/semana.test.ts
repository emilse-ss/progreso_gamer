import { describe, expect, it } from "vitest";
import { horasYDiasSemana, porcentajeHoras } from "./semana";

const ecuador = (fechaHora: string) => new Date(`${fechaHora}-05:00`);
const partida = (fechaHora: string, duracionMinutos: number) => ({
  fecha: ecuador(fechaHora),
  duracionMinutos
});

const semana9a15 = { inicio: "2026-11-09", fin: "2026-11-15" };
const semana16a22 = { inicio: "2026-11-16", fin: "2026-11-22" };

describe("horasYDiasSemana", () => {
  it("CA-04.1 cuenta solo las partidas de la semana de lunes a domingo", () => {
    const partidas = [
      partida("2026-11-08T22:00:00", 60),
      partida("2026-11-11T20:00:00", 60),
      partida("2026-11-16T00:30:00", 30)
    ];
    expect(horasYDiasSemana(partidas, semana9a15)).toEqual({
      horasSemana: 1,
      diasJugadosSemana: 1
    });
    expect(horasYDiasSemana(partidas, semana16a22)).toEqual({
      horasSemana: 0.5,
      diasJugadosSemana: 1
    });
  });

  it("CA-04.2 una partida que cruza la medianoche suma entera al día en que empieza", () => {
    const partidas = [partida("2026-11-15T23:30:00", 90)];
    expect(horasYDiasSemana(partidas, semana9a15)).toEqual({
      horasSemana: 1.5,
      diasJugadosSemana: 1
    });
    expect(horasYDiasSemana(partidas, semana16a22)).toEqual({
      horasSemana: 0,
      diasJugadosSemana: 0
    });
  });

  it("CA-04.3 varias partidas el mismo día, una a las 23:30, cuentan un solo día", () => {
    const partidas = [
      partida("2026-11-10T10:00:00", 60),
      partida("2026-11-10T21:00:00", 45),
      partida("2026-11-10T23:30:00", 30)
    ];
    expect(horasYDiasSemana(partidas, semana9a15)).toEqual({
      horasSemana: 2.3,
      diasJugadosSemana: 1
    });
  });

  it("sin partidas: 0 horas y 0 días", () => {
    expect(horasYDiasSemana([], semana9a15)).toEqual({
      horasSemana: 0,
      diasJugadosSemana: 0
    });
  });
});

describe("porcentajeHoras", () => {
  it("CA-04.4 porcentaje de horas: 210 min con meta de 5 h → 3.5 h y 70 %", () => {
    const partidas = [
      partida("2026-11-09T20:00:00", 70),
      partida("2026-11-10T20:00:00", 70),
      partida("2026-11-11T20:00:00", 70)
    ];
    const { horasSemana } = horasYDiasSemana(partidas, semana9a15);
    expect(horasSemana).toBe(3.5);
    expect(porcentajeHoras(horasSemana, 5)).toBe(70);
  });

  it("CA-04.5 meta superada: 7 h con meta de 5 h → 100 %, no 140 %", () => {
    const partidas = [
      partida("2026-11-09T20:00:00", 120),
      partida("2026-11-11T20:00:00", 180),
      partida("2026-11-14T20:00:00", 120)
    ];
    const { horasSemana } = horasYDiasSemana(partidas, semana9a15);
    expect(horasSemana).toBe(7);
    expect(porcentajeHoras(horasSemana, 5)).toBe(100);
  });

  it("CA-04.6 redondeo antes del porcentaje: 298 min → 5.0 h → 100 %", () => {
    const partidas = [partida("2026-11-12T20:00:00", 298)];
    const { horasSemana } = horasYDiasSemana(partidas, semana9a15);
    expect(horasSemana).toBe(5);
    expect(porcentajeHoras(horasSemana, 5)).toBe(100);
  });

  it("CA-02.4 la edición vale para toda la semana: 4 h con la meta nueva de 10 h → 40 %", () => {
    expect(porcentajeHoras(4, 10)).toBe(40);
  });
});
