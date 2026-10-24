import mongoose from "mongoose";
import { ApiError } from "../errors/ApiError";
import Partida, { PartidaInput } from "../modelos/Partida.model";
import Videojuego from "../modelos/Videojuego.model";

function assertValidId(id: string, field: string): void {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new ApiError(`El identificador de ${field} no tiene un formato válido`, 400);
  }
}

export async function listarPartidas() {
  return Partida.find().populate("videojuego").sort({ fecha: -1 });
}

export async function crearPartida(input: PartidaInput) {
  assertValidId(input.videojuego, "videojuego");

  const videojuegoExiste = await Videojuego.exists({ _id: input.videojuego });
  if (!videojuegoExiste) {
    throw new ApiError("Videojuego asociado no encontrado", 404);
  }

  return Partida.create(input);
}

export async function eliminarPartida(id: string): Promise<void> {
  assertValidId(id, "partida");

  const partida = await Partida.findByIdAndDelete(id);
  if (!partida) {
    throw new ApiError("Partida no encontrada", 404);
  }
}

export async function listarPartidasPorVideojuego(videojuegoId: string) {
  assertValidId(videojuegoId, "videojuego");

  const videojuegoExiste = await Videojuego.exists({ _id: videojuegoId });
  if (!videojuegoExiste) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  return Partida.find({ videojuego: videojuegoId })
    .populate("videojuego")
    .sort({ fecha: -1 });
}
