import mongoose, { Types } from "mongoose";
import { objetivoRepetido, ordenarHitos } from "../dominio/hitos";
import { ApiError } from "../errors/ApiError";
import Meta, { HitoInput, MetaInput, MetaUpdateInput } from "../modelos/Meta.model";
import Videojuego from "../modelos/Videojuego.model";

/** Estados en los que un videojuego no puede tener una meta activa (R-19, R-20). */
export const ESTADOS_SIN_META_ACTIVA = ["completado", "abandonado"];
const MENSAJE_YA_TIENE_META_ACTIVA = "Este videojuego ya tiene una meta activa";
const MENSAJE_YA_TIENE_OTRA_META_ACTIVA = "Este videojuego ya tiene otra meta activa";

// Copia del helper de los otros servicios; la consolidación queda diferida (D-07).
function assertValidId(id: string, field: string): void {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new ApiError(`El identificador de ${field} no tiene un formato válido`, 400);
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

/** Rechaza objetivos repetidos y devuelve los hitos ordenados (R-16). */
function prepararHitos(hitos: HitoInput[]): HitoInput[] {
  const repetido = objetivoRepetido(hitos);
  if (repetido !== null) {
    throw new ApiError(`No puede haber dos hitos con el mismo objetivo (${repetido} %)`, 400);
  }
  return ordenarHitos(hitos);
}

/** El videojuego existe y su estado admite una meta activa (R-19). */
async function asegurarVideojuegoAdmiteMeta(videojuegoId: string | Types.ObjectId): Promise<void> {
  const videojuego = await Videojuego.findById(videojuegoId).select("estado");
  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }
  if (videojuego.estado && ESTADOS_SIN_META_ACTIVA.includes(videojuego.estado)) {
    throw new ApiError(
      `El videojuego está ${videojuego.estado}: no puede tener una meta activa`,
      409
    );
  }
}

export async function crearMeta(input: MetaInput) {
  assertValidId(input.videojuego, "videojuego");
  const hitos = prepararHitos(input.hitos ?? []);
  await asegurarVideojuegoAdmiteMeta(input.videojuego);

  // Primera defensa de R-13; el índice único parcial cubre la condición de carrera.
  if (await Meta.exists({ videojuego: input.videojuego, activa: true })) {
    throw new ApiError(MENSAJE_YA_TIENE_META_ACTIVA, 409);
  }

  try {
    return await Meta.create({ ...input, hitos });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(MENSAJE_YA_TIENE_META_ACTIVA, 409);
    }
    throw error;
  }
}

export async function listarMetasPorVideojuego(videojuegoId: string) {
  assertValidId(videojuegoId, "videojuego");

  const videojuegoExiste = await Videojuego.exists({ _id: videojuegoId });
  if (!videojuegoExiste) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  // La meta activa primero; después las inactivas, de la más reciente a la más antigua.
  return Meta.find({ videojuego: videojuegoId }).sort({ activa: -1, updatedAt: -1 });
}

export async function obtenerMeta(id: string) {
  assertValidId(id, "meta");

  const meta = await Meta.findById(id);
  if (!meta) {
    throw new ApiError("Meta no encontrada", 404);
  }
  return meta;
}

/** Distingue «no existe» (404) de «existe pero está inactiva» (409). */
async function errorMetaNoActiva(id: string, mensaje409: string): Promise<never> {
  if (await Meta.exists({ _id: id })) {
    throw new ApiError(mensaje409, 409);
  }
  throw new ApiError("Meta no encontrada", 404);
}

export async function actualizarMeta(id: string, input: MetaUpdateInput) {
  assertValidId(id, "meta");
  const cambios: MetaUpdateInput = { ...input };
  if (input.hitos) {
    cambios.hitos = prepararHitos(input.hitos);
  }

  // Solo la meta activa se edita (R-14); runValidators aplica las reglas del esquema (D-08).
  const meta = await Meta.findOneAndUpdate(
    { _id: id, activa: true },
    { $set: cambios },
    { new: true, runValidators: true }
  );
  return meta ?? errorMetaNoActiva(id, "Solo se puede editar la meta activa");
}

export async function desactivarMeta(id: string) {
  assertValidId(id, "meta");

  const meta = await Meta.findOneAndUpdate(
    { _id: id, activa: true },
    { $set: { activa: false } },
    { new: true, runValidators: true }
  );
  return meta ?? errorMetaNoActiva(id, "La meta ya está inactiva");
}

export async function reactivarMeta(id: string) {
  const meta = await obtenerMeta(id);
  if (meta.activa) {
    throw new ApiError("La meta ya está activa", 409);
  }

  await asegurarVideojuegoAdmiteMeta(meta.videojuego);
  if (await Meta.exists({ videojuego: meta.videojuego, activa: true })) {
    throw new ApiError(MENSAJE_YA_TIENE_OTRA_META_ACTIVA, 409);
  }

  try {
    const reactivada = await Meta.findOneAndUpdate(
      { _id: id, activa: false },
      { $set: { activa: true } },
      { new: true, runValidators: true }
    );
    if (!reactivada) {
      throw new ApiError("La meta ya está activa", 409);
    }
    return reactivada;
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(MENSAJE_YA_TIENE_OTRA_META_ACTIVA, 409);
    }
    throw error;
  }
}
