import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError } from "../errors/ApiError";

type JsonParseError = SyntaxError & {
  status: number;
  type: string;
};

function isJsonParseError(error: unknown): error is JsonParseError {
  if (!(error instanceof SyntaxError) || typeof error !== "object" || error === null) {
    return false;
  }

  return (
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

// Error de clave duplicada de MongoDB (E11000): una condición de carrera que la
// validación del servicio no alcanzó a detectar (D-05).
function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const requestId = response.locals.requestId;

  if (isJsonParseError(error)) {
    response.status(400).json({
      error: "El cuerpo de la solicitud contiene JSON mal formado",
      requestId
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: error.message, requestId });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: error.message, requestId });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.status).json({ error: error.message, requestId });
    return;
  }

  if (isDuplicateKeyError(error)) {
    response.status(409).json({
      error: "Ya existe un registro con esos datos",
      requestId
    });
    return;
  }

  console.error("Error inesperado en la solicitud", { requestId, error });
  response.status(500).json({
    error: "Error interno del servidor",
    requestId
  });
};

export default errorHandler;
