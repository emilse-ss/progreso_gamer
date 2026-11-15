import { describe, expect, it } from "vitest";
import { rachas } from "./racha";

const ecuador = (fechaHora: string) => new Date(`${fechaHora}-05:00`);
const partida = (fechaHora: string, duracionMinutos = 60) => ({
  fecha: ecuador(fechaHora),
  duracionMinutos,
});

// Partidas del jueves 12, viernes 13 y sábado 14 de noviembre de 2026, a las 20:00.
const juevesASabado = [
  partida("2026-11-12T20:00:00"),
  partida("2026-11-13T20:00:00"),
  partida("2026-11-14T20:00:00"),
];

describe("rachas", () => {
  it("CA-05.1 racha de días consecutivos, sin importar el avance", () => {
    // El avance no forma parte de los datos del cálculo: cualquier partida cuenta.
    expect(
      rachas(juevesASabado, ecuador("2026-11-14T21:00:00")).rachaActual,
    ).toBe(3);
  });

  it("CA-05.2 hoy sin partida y ayer sí: la racha sigue viva", () => {
    expect(rachas(juevesASabado, ecuador("2026-11-15T10:00:00"))).toEqual({
      rachaActual: 3,
      mejorRacha: 3,
    });
  });

  it("CA-05.3 un día completo sin partida rompe la racha", () => {
    expect(rachas(juevesASabado, ecuador("2026-11-17T09:00:00"))).toEqual({
      rachaActual: 0,
      mejorRacha: 3,
    });
  });

  it("CA-05.4 la racha cruza de domingo a lunes", () => {
    const partidas = [...juevesASabado, partida("2026-11-15T23:30:00", 20)];
    expect(rachas(partidas, ecuador("2026-11-16T09:00:00")).rachaActual).toBe(
      4,
    );
  });

  it("CA-05.5 mejor racha del historial", () => {
    const partidas = [
      ...["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((dia) =>
        partida(`2026-11-${dia}T20:00:00`),
      ),
      ...["12", "13", "14", "15"].map((dia) =>
        partida(`2026-11-${dia}T18:00:00`),
      ),
    ];
    expect(rachas(partidas, ecuador("2026-11-15T20:00:00"))).toEqual({
      rachaActual: 4,
      mejorRacha: 9,
    });
  });

  it("CA-05.6 varias partidas el mismo día cuentan un solo día en la racha", () => {
    const partidas = [
      partida("2026-11-12T10:00:00"),
      partida("2026-11-12T22:00:00"),
      partida("2026-11-13T20:00:00"),
    ];
    expect(rachas(partidas, ecuador("2026-11-13T23:00:00")).rachaActual).toBe(
      2,
    );
  });

  it("CA-05.7 una partida de un día futuro no alarga la racha", () => {
    const partidas = [...juevesASabado, partida("2026-11-17T20:00:00")];
    expect(rachas(partidas, ecuador("2026-11-15T10:00:00"))).toEqual({
      rachaActual: 3,
      mejorRacha: 3,
    });
  });

  it("sin partidas: racha actual y mejor racha en 0", () => {
    expect(rachas([], ecuador("2026-11-15T10:00:00"))).toEqual({
      rachaActual: 0,
      mejorRacha: 0,
    });
  });
});
