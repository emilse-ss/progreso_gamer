import { Router } from "express";
import { actualizar, crear, desactivar, obtener, reactivar } from "../controllers/meta.controller";

const metaRoutes = Router();

metaRoutes.post("/", crear);
metaRoutes.get("/:id", obtener);
metaRoutes.patch("/:id", actualizar);
metaRoutes.patch("/:id/desactivar", desactivar);
metaRoutes.patch("/:id/reactivar", reactivar);

export default metaRoutes;
