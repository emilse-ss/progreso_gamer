import { randomUUID } from "crypto";
import { RequestHandler } from "express";

const requestId: RequestHandler = (_request, response, next) => {
  const id = randomUUID();
  response.locals.requestId = id;
  response.setHeader("X-Request-Id", id);
  next();
};

export default requestId;
