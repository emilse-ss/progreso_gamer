import { RequestHandler } from "express";
import { ApiError } from "../errors/ApiError";

const notFound: RequestHandler = (request, _response, next) => {
  next(new ApiError(`Ruta no encontrada: ${request.method} ${request.originalUrl}`, 404));
};

export default notFound;
