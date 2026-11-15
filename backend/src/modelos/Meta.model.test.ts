// Validación del esquema sin conexión a la base de datos (validateSync).
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import Meta from "./Meta.model";

const base = () => ({
  videojuego: new Types.ObjectId(),
  horasSemanales: 5,
  diasPorSemana: 3
});

const erroresDe = (datos: Record<string, unknown>) =>
  Object.keys(new Meta(datos).validateSync()?.errors ?? {});

const hito = (porcentajeObjetivo: number, descripcion = "Llegar al objetivo") => ({
  descripcion,
  porcentajeObjetivo
});

describe("Meta.model", () => {
  it("CA-01.2 límites de horas y días: horas enteras de 1 a 100, días enteros de 1 a 7", () => {
    for (const horasSemanales of [4.5, 0, 120]) {
      expect(erroresDe({ ...base(), horasSemanales })).toContain("horasSemanales");
    }
    for (const diasPorSemana of [0, 8, 2.5]) {
      expect(erroresDe({ ...base(), diasPorSemana })).toContain("diasPorSemana");
    }
    expect(erroresDe({ ...base(), horasSemanales: 1, diasPorSemana: 7 })).toEqual([]);
    expect(erroresDe({ ...base(), horasSemanales: 100, diasPorSemana: 1 })).toEqual([]);
  });

  it("CA-01.4 hitos inválidos: más de 5, objetivo no entero o fuera de 1 a 100", () => {
    const seis = [10, 20, 30, 40, 50, 60].map((objetivo) => hito(objetivo));
    expect(erroresDe({ ...base(), hitos: seis })).toContain("hitos");
    for (const objetivo of [33.3, 0, 101]) {
      expect(erroresDe({ ...base(), hitos: [hito(objetivo)] })).toContain(
        "hitos.0.porcentajeObjetivo"
      );
    }
  });

  it("CA-01.5 meta sin hitos: es válida y la lista queda vacía", () => {
    const meta = new Meta(base());
    expect(meta.validateSync()).toBeUndefined();
    expect(meta.hitos).toHaveLength(0);
  });

  it("CA-01.8 descripción del hito obligatoria, con trim y máximo 100 caracteres", () => {
    for (const descripcion of ["", "   ", "x".repeat(101)]) {
      expect(erroresDe({ ...base(), hitos: [hito(75, descripcion)] })).toContain(
        "hitos.0.descripcion"
      );
    }
    expect(erroresDe({ ...base(), hitos: [{ porcentajeObjetivo: 75 }] })).toContain(
      "hitos.0.descripcion"
    );

    const conEspacios = new Meta({ ...base(), hitos: [hito(50, "  Mitad  ")] });
    expect(conEspacios.validateSync()).toBeUndefined();
    expect(conEspacios.hitos[0].descripcion).toBe("Mitad");

    expect(erroresDe({ ...base(), hitos: [hito(50, "x".repeat(100))] })).toEqual([]);
  });

  it("CA-02.5 edición con valores inválidos: 4.5 h u 8 días se rechazan", () => {
    expect(erroresDe({ ...base(), horasSemanales: 4.5 })).toEqual(["horasSemanales"]);
    expect(erroresDe({ ...base(), diasPorSemana: 8 })).toEqual(["diasPorSemana"]);
  });

  it("videojuego, horas y días son obligatorios; activa es true por defecto", () => {
    expect(erroresDe({})).toEqual(
      expect.arrayContaining(["videojuego", "horasSemanales", "diasPorSemana"])
    );
    expect(new Meta(base()).activa).toBe(true);
  });

  it("declara el índice único parcial: una sola meta activa por videojuego", () => {
    expect(Meta.schema.indexes()).toContainEqual([
      { videojuego: 1 },
      expect.objectContaining({
        unique: true,
        partialFilterExpression: { activa: true },
        name: "meta_activa_unica_por_videojuego"
      })
    ]);
  });
});
