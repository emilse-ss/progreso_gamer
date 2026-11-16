import { RequestHandler } from "express";
import mongoose from "mongoose";
import { fechaConHoraYZona } from "../dominio/partida";
import { ApiError } from "../errors/ApiError";
import { PartidaInput } from "../modelos/Partida.model";
import {
  crearPartida,
  eliminarPartida,
  listarPartidas,
  listarPartidasPorVideojuego
} from "../services/partida.service";

type IdParams = { id: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePartidaInput(value: unknown): PartidaInput {
  if (!isRecord(value)) {
    throw new ApiError("El cuerpo debe ser un objeto JSON", 400);
  }

  const allowedFields = new Set([
    "videojuego",
    "fecha",
    "duracionMinutos",
    "porcentajeAvance",
    "notas"
  ]);
  const unexpectedField = Object.keys(value).find((field) => !allowedFields.has(field));
  if (unexpectedField) {
    throw new ApiError(`El campo ${unexpectedField} no está permitido`, 400);
  }

  if (
    typeof value.videojuego !== "string" ||
    !mongoose.isObjectIdOrHexString(value.videojuego)
  ) {
    throw new ApiError("videojuego debe ser un ObjectId válido", 400);
  }

  // Forma de la fecha: ISO con hora y zona; sin hora caería en otro día en Ecuador (R-22, D-02).
  if (typeof value.fecha !== "string" || !fechaConHoraYZona(value.fecha)) {
    throw new ApiError("La fecha debe incluir la hora y la zona horaria", 400);
  }

  // Solo el tipo: el rango de 5 a 1440 min es una regla del servicio y del esquema (D-07).
  if (typeof value.duracionMinutos !== "number" || !Number.isFinite(value.duracionMinutos)) {
    throw new ApiError("duracionMinutos debe ser un número", 400);
  }

  // El avance es obligatorio en las partidas nuevas (R-18, D-03).
  if (value.porcentajeAvance === undefined) {
    throw new ApiError("porcentajeAvance es obligatorio", 400);
  }

  if (
    typeof value.porcentajeAvance !== "number" ||
    !Number.isFinite(value.porcentajeAvance) ||
    value.porcentajeAvance < 0 ||
    value.porcentajeAvance > 100
  ) {
    throw new ApiError("porcentajeAvance debe ser un número entre 0 y 100", 400);
  }

  if (value.notas !== undefined && typeof value.notas !== "string") {
    throw new ApiError("notas debe ser texto", 400);
  }

  return {
    videojuego: value.videojuego,
    fecha: new Date(value.fecha),
    duracionMinutos: value.duracionMinutos,
    porcentajeAvance: value.porcentajeAvance,
    ...(typeof value.notas === "string" ? { notas: value.notas } : {})
  };
}

export const listar: RequestHandler = async (_request, response, next) => {
  try {
    const partidas = await listarPartidas();
    response.status(200).json({
      total: partidas.length,
      partidas,
      requestId: response.locals.requestId
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const crear: RequestHandler = async (request, response, next) => {
  try {
    const partida = await crearPartida(parsePartidaInput(request.body));
    response.status(201).json({ partida, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const eliminar: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    await eliminarPartida(request.params.id);
    response.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};

export const listarPorVideojuego: RequestHandler<IdParams> = async (
  request,
  response,
  next
) => {
  try {
    const partidas = await listarPartidasPorVideojuego(request.params.id);
    response.status(200).json({
      total: partidas.length,
      partidas,
      requestId: response.locals.requestId
    });
  } catch (error: unknown) {
    next(error);
  }
};
