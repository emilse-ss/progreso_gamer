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

  console.error("Error inesperado en la solicitud", { requestId, error });
  response.status(500).json({
    error: "Error interno del servidor",
    requestId
  });
};

export default errorHandler;
