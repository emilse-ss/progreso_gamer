import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../errors/ApiError";
import errorHandler from "./errorHandler";

interface RespuestaSimulada {
  statusCode?: number;
  body?: unknown;
}

function ejecutar(error: unknown): RespuestaSimulada {
  const resultado: RespuestaSimulada = {};
  const response = {
    headersSent: false,
    locals: { requestId: "req-1" },
    status(codigo: number) {
      resultado.statusCode = codigo;
      return this;
    },
    json(cuerpo: unknown) {
      resultado.body = cuerpo;
      return this;
    }
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;

  errorHandler(error, {} as Request, response, next);
  return resultado;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("errorHandler", () => {
  it("D-05 error de clave duplicada (E11000) → 409 genérico", () => {
    const duplicado = new mongoose.mongo.MongoServerError({
      message:
        "E11000 duplicate key error collection: metas index: meta_activa_unica_por_videojuego",
      code: 11000
    });
    expect(ejecutar(duplicado)).toEqual({
      statusCode: 409,
      body: {
        error: "Ya existe un registro con esos datos",
        requestId: "req-1"
      }
    });
  });

  it("ApiError 409 conserva su estado y su mensaje", () => {
    expect(ejecutar(new ApiError("Este videojuego ya tiene una meta activa", 409))).toEqual({
      statusCode: 409,
      body: {
        error: "Este videojuego ya tiene una meta activa",
        requestId: "req-1"
      }
    });
  });

  it("ApiError 404 conserva su estado y su mensaje", () => {
    expect(ejecutar(new ApiError("Meta no encontrada", 404))).toEqual({
      statusCode: 404,
      body: { error: "Meta no encontrada", requestId: "req-1" }
    });
  });

  it("ValidationError del esquema → 400", () => {
    const error = new mongoose.Error.ValidationError();
    expect(ejecutar(error).statusCode).toBe(400);
  });

  it("CastError → 400", () => {
    const error = new mongoose.Error.CastError("ObjectId", "abc", "_id");
    expect(ejecutar(error).statusCode).toBe(400);
  });

  it("error desconocido → 500 sin detalles internos", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(ejecutar(new Error("conexión perdida con detalles internos"))).toEqual({
      statusCode: 500,
      body: { error: "Error interno del servidor", requestId: "req-1" }
    });
  });
});
