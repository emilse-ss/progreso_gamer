import { describe, expect, it } from "vitest";
import { metaCumplida } from "./cumplimiento";
import { horasYDiasSemana, porcentajeHoras } from "./semana";

const ecuador = (fechaHora: string) => new Date(`${fechaHora}-05:00`);
const partida = (fechaHora: string, duracionMinutos: number) => ({
  fecha: ecuador(fechaHora),
  duracionMinutos
});

const semana9a15 = { inicio: "2026-11-09", fin: "2026-11-15" };
const meta5h4dias = { horasSemanales: 5, diasPorSemana: 4, hitos: [] };

function evaluar(partidas: ReturnType<typeof partida>[]) {
  const { horasSemana, diasJugadosSemana } = horasYDiasSemana(partidas, semana9a15);
  const porcentaje = porcentajeHoras(horasSemana, meta5h4dias.horasSemanales);
  return { horasSemana, porcentaje, diasJugadosSemana };
}

describe("metaCumplida", () => {
  it("CA-13.1 cumplida: 6.0 h (100 %) y 4 de 4 días", () => {
    const resultado = evaluar([
      partida("2026-11-09T20:00:00", 90),
      partida("2026-11-11T20:00:00", 90),
      partida("2026-11-13T20:00:00", 90),
      partida("2026-11-15T20:00:00", 90)
    ]);
    expect(resultado).toEqual({
      horasSemana: 6,
      porcentaje: 100,
      diasJugadosSemana: 4
    });
    expect(metaCumplida(meta5h4dias, resultado.porcentaje, resultado.diasJugadosSemana)).toBe(true);
  });

  it("CA-13.2 horas sí, días no: 5.0 h (100 %) en 1 de 4 días", () => {
    const resultado = evaluar([partida("2026-11-14T15:00:00", 300)]);
    expect(resultado).toEqual({
      horasSemana: 5,
      porcentaje: 100,
      diasJugadosSemana: 1
    });
    expect(metaCumplida(meta5h4dias, resultado.porcentaje, resultado.diasJugadosSemana)).toBe(
      false
    );
  });

  it("CA-13.3 días sí, horas no: 4.0 h (80 %) en 4 de 4 días", () => {
    const resultado = evaluar([
      partida("2026-11-09T20:00:00", 60),
      partida("2026-11-10T20:00:00", 60),
      partida("2026-11-11T20:00:00", 60),
      partida("2026-11-12T20:00:00", 60)
    ]);
    expect(resultado).toEqual({
      horasSemana: 4,
      porcentaje: 80,
      diasJugadosSemana: 4
    });
    expect(metaCumplida(meta5h4dias, resultado.porcentaje, resultado.diasJugadosSemana)).toBe(
      false
    );
  });
});
