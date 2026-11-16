// Validación del esquema de Partida sin conexión a la base de datos (validateSync).
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import Partida from "./Partida.model";

const base = () => ({
  videojuego: new Types.ObjectId(),
  fecha: new Date("2026-11-15T10:00:00-05:00"),
  duracionMinutos: 60
});

const erroresDe = (datos: Record<string, unknown>) =>
  Object.keys(new Partida(datos).validateSync()?.errors ?? {});

describe("Partida.model", () => {
  it("CA-12.2 porcentajeAvance es obligatorio en una partida nueva", () => {
    expect(erroresDe(base())).toContain("porcentajeAvance");
  });

  it("CA-12.2 una partida con avance 0 es válida (0 no cuenta como «sin avance»)", () => {
    expect(erroresDe({ ...base(), porcentajeAvance: 0 })).toEqual([]);
  });
});
