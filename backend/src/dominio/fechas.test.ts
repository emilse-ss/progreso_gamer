import { describe, expect, it } from "vitest";
import { diaEcuador, partidasHastaHoy, semanaDe, sumarDias } from "./fechas";

// Todos los instantes llevan su desfase explícito (-05:00 = hora de Ecuador, o Z = UTC)
// para que los tests no dependan de la zona horaria de la máquina.
const ecuador = (fechaHora: string) => new Date(`${fechaHora}-05:00`);

describe("diaEcuador", () => {
  it("CA-04.2 cruza la medianoche: el domingo 15 a las 23:30 sigue siendo domingo", () => {
    expect(diaEcuador(new Date("2026-11-16T04:30:00Z"))).toBe("2026-11-15");
    expect(diaEcuador(ecuador("2026-11-15T23:30:00"))).toBe("2026-11-15");
    expect(diaEcuador(ecuador("2026-11-16T00:00:00"))).toBe("2026-11-16");
  });

  it("CA-04.3 una partida a las 23:30 cae en su día de Ecuador, no en el de UTC", () => {
    expect(diaEcuador(new Date("2026-11-11T04:30:00Z"))).toBe("2026-11-10");
    expect(diaEcuador(new Date("2026-11-11T05:00:00Z"))).toBe("2026-11-11");
  });
});

describe("sumarDias", () => {
  it("suma y resta días cruzando mes, año y años bisiestos", () => {
    expect(sumarDias("2026-11-15", 1)).toBe("2026-11-16");
    expect(sumarDias("2026-11-16", -1)).toBe("2026-11-15");
    expect(sumarDias("2026-11-30", 1)).toBe("2026-12-01");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("semanaDe", () => {
  it("CA-04.1 semana de lunes a domingo en hora de Ecuador", () => {
    const semana9a15 = { inicio: "2026-11-09", fin: "2026-11-15" };
    expect(semanaDe(ecuador("2026-11-09T00:00:00"))).toEqual(semana9a15);
    expect(semanaDe(ecuador("2026-11-11T12:00:00"))).toEqual(semana9a15);
    expect(semanaDe(ecuador("2026-11-15T21:00:00"))).toEqual(semana9a15);
    expect(semanaDe(ecuador("2026-11-15T23:59:00"))).toEqual(semana9a15);
    expect(semanaDe(ecuador("2026-11-16T00:10:00"))).toEqual({
      inicio: "2026-11-16",
      fin: "2026-11-22",
    });
    // El domingo 8 a las 22:00 pertenece a la semana anterior, aunque en UTC ya sea lunes 9.
    expect(semanaDe(ecuador("2026-11-08T22:00:00"))).toEqual({
      inicio: "2026-11-02",
      fin: "2026-11-08",
    });
  });
});

describe("partidasHastaHoy", () => {
  const ahora = ecuador("2026-11-15T10:00:00"); // domingo 15 a las 10:00

  it("CA-04.8 descarta una partida de un día futuro ya guardada", () => {
    const partidas = [
      { fecha: ecuador("2026-11-11T20:00:00"), duracionMinutos: 60 },
      { fecha: ecuador("2026-11-17T20:00:00"), duracionMinutos: 120 },
    ];
    expect(partidasHastaHoy(partidas, ahora)).toEqual([partidas[0]]);
  });

  it("CA-04.9 conserva una partida de hoy con hora posterior a ahora", () => {
    const partidas = [
      { fecha: ecuador("2026-11-15T18:00:00"), duracionMinutos: 60 },
      { fecha: ecuador("2026-11-16T00:30:00"), duracionMinutos: 30 },
    ];
    expect(partidasHastaHoy(partidas, ahora)).toEqual([partidas[0]]);
  });
});
