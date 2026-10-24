import { Router } from "express";
import {
  actualizar,
  actualizarLogro,
  borrarLogro,
  crear,
  crearLogro,
  eliminar,
  listar,
  listarPartidas,
  obtener,
  resumen
} from "../controllers/videojuego.controller";

const videojuegoRoutes = Router();

videojuegoRoutes.get("/", listar);
videojuegoRoutes.get("/:id/resumen", resumen);
videojuegoRoutes.get("/:id/partidas", listarPartidas);
videojuegoRoutes.get("/:id", obtener);
videojuegoRoutes.post("/", crear);
videojuegoRoutes.put("/:id", actualizar);
videojuegoRoutes.patch("/:id", actualizar);
videojuegoRoutes.delete("/:id", eliminar);
videojuegoRoutes.post("/:id/logros", crearLogro);
videojuegoRoutes.patch("/:id/logros/:logroId", actualizarLogro);
videojuegoRoutes.delete("/:id/logros/:logroId", borrarLogro);

export default videojuegoRoutes;
