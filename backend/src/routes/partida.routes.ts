import { Router } from "express";
import {
  crear,
  eliminar,
  listar
} from "../controllers/partida.controller";

const partidaRoutes = Router();

partidaRoutes.get("/", listar);
partidaRoutes.post("/", crear);
partidaRoutes.delete("/:id", eliminar);

export default partidaRoutes;
