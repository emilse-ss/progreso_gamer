import cors from "cors";
import express from "express";
import config from "./config/env";
import errorHandler from "./middlewares/errorHandler";
import logger from "./middlewares/logger";
import notFound from "./middlewares/notFound";
import requestId from "./middlewares/requestId";
import healthRoutes from "./routes/health.routes";
import partidaRoutes from "./routes/partida.routes";
import videojuegoRoutes from "./routes/videojuego.routes";

const app = express();

app.use(requestId);
app.use(logger);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use(healthRoutes);
app.use("/api/partidas", partidaRoutes);
app.use("/api/videojuegos", videojuegoRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
