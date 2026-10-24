import { RequestHandler } from "express";

const logger: RequestHandler = (request, response, next) => {
  const startedAt = Date.now();

  response.on("finish", () => {
    console.log(
      JSON.stringify({
        method: request.method,
        url: request.originalUrl,
        requestId: response.locals.requestId,
        status: response.statusCode,
        durationMs: Date.now() - startedAt
      })
    );
  });

  next();
};

export default logger;
