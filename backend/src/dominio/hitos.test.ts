import { describe, expect, it } from "vitest";
import { evaluarHitos, objetivoRepetido, ordenarHitos } from "./hitos";

const hito = (porcentajeObjetivo: number, descripcion = `Llegar al ${porcentajeObjetivo} %`) => ({
  descripcion,
  porcentajeObjetivo
});

describe("ordenarHitos", () => {
  it("CA-01.3 hitos ordenados de menor a mayor objetivo", () => {
    const hitos = [hito(50, "Mitad"), hito(25, "Un cuarto"), hito(100, "Terminar")];
    expect(ordenarHitos(hitos).map((h) => h.porcentajeObjetivo)).toEqual([25, 50, 100]);
  });

  it("no modifica el arreglo de entrada", () => {
    const hitos = [hito(100), hito(25)];
    ordenarHitos(hitos);
    expect(hitos.map((h) => h.porcentajeObjetivo)).toEqual([100, 25]);
  });
});

describe("objetivoRepetido", () => {
  it("CA-01.4 detecta un objetivo de hito repetido", () => {
    expect(objetivoRepetido([hito(50), hito(25), hito(50, "Mitad otra vez")])).toBe(50);
    expect(objetivoRepetido([hito(25), hito(50)])).toBeNull();
    expect(objetivoRepetido([])).toBeNull();
  });
});

describe("evaluarHitos", () => {
  const hitos = [hito(25), hito(50), hito(100)];

  it("CA-06.1 hitos alcanzados con avance 55 %", () => {
    expect(evaluarHitos(hitos, 55).map((h) => h.alcanzado)).toEqual([true, true, false]);
  });

  it("CA-06.2 un hito deja de estar alcanzado cuando el avance baja a 40 %", () => {
    expect(evaluarHitos(hitos, 40).map((h) => h.alcanzado)).toEqual([true, false, false]);
  });

  it("CA-06.3 avance igual al objetivo: el hito está alcanzado", () => {
    expect(evaluarHitos([hito(50)], 50)).toEqual([
      {
        descripcion: "Llegar al 50 %",
        porcentajeObjetivo: 50,
        alcanzado: true
      }
    ]);
  });

  it("CA-06.4 los hitos se devuelven ordenados, cada uno con su estado", () => {
    const evaluados = evaluarHitos([hito(100), hito(25), hito(50)], 30);
    expect(evaluados.map((h) => [h.porcentajeObjetivo, h.alcanzado])).toEqual([
      [25, true],
      [50, false],
      [100, false]
    ]);
  });
});
