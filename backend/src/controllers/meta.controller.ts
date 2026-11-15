import { RequestHandler } from "express";
import { ApiError } from "../errors/ApiError";
import { HitoInput, MetaInput, MetaUpdateInput } from "../modelos/Meta.model";
import {
  actualizarMeta,
  crearMeta,
  desactivarMeta,
  obtenerMeta,
  reactivarMeta
} from "../services/meta.service";

type IdParams = { id: string };

const CAMPOS_EDITABLES = ["horasSemanales", "diasPorSemana", "hitos"] as const;
const CAMPOS_NO_MODIFICABLES = ["videojuego", "activa"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNumero(value: unknown, campo: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError(`${campo} debe ser un número`, 400);
  }
  return value;
}

// Forma de los hitos; la obligatoriedad, el trim, la longitud y los rangos los valida el
// esquema, y los objetivos repetidos el servicio (convención D-07).
function parseHitos(value: unknown): HitoInput[] {
  if (!Array.isArray(value)) {
    throw new ApiError("hitos debe ser una lista", 400);
  }

  return value.map((hito: unknown) => {
    if (!isRecord(hito)) {
      throw new ApiError("Cada hito debe ser un objeto con descripcion y porcentajeObjetivo", 400);
    }
    const campoDesconocido = Object.keys(hito).find(
      (campo) => campo !== "descripcion" && campo !== "porcentajeObjetivo"
    );
    if (campoDesconocido) {
      throw new ApiError(`El campo ${campoDesconocido} no está permitido en un hito`, 400);
    }
    if (hito.descripcion !== undefined && typeof hito.descripcion !== "string") {
      throw new ApiError("descripcion del hito debe ser texto", 400);
    }
    return {
      descripcion: hito.descripcion as string,
      porcentajeObjetivo: parseNumero(hito.porcentajeObjetivo, "porcentajeObjetivo del hito")
    };
  });
}

function parseNuevaMeta(value: unknown): MetaInput {
  if (!isRecord(value)) {
    throw new ApiError("El cuerpo debe ser un objeto JSON", 400);
  }

  const permitidos = new Set(["videojuego", ...CAMPOS_EDITABLES]);
  const campoDesconocido = Object.keys(value).find((campo) => !permitidos.has(campo));
  if (campoDesconocido) {
    throw new ApiError(`El campo ${campoDesconocido} no está permitido`, 400);
  }

  if (typeof value.videojuego !== "string") {
    throw new ApiError("videojuego debe ser el identificador del videojuego", 400);
  }

  return {
    videojuego: value.videojuego,
    horasSemanales: parseNumero(value.horasSemanales, "horasSemanales"),
    diasPorSemana: parseNumero(value.diasPorSemana, "diasPorSemana"),
    ...(value.hitos !== undefined ? { hitos: parseHitos(value.hitos) } : {})
  };
}

function parseEdicionMeta(value: unknown): MetaUpdateInput {
  if (!isRecord(value)) {
    throw new ApiError("El cuerpo debe ser un objeto JSON", 400);
  }

  for (const campo of Object.keys(value)) {
    if (CAMPOS_NO_MODIFICABLES.includes(campo)) {
      throw new ApiError(`El campo ${campo} no se puede modificar`, 400);
    }
    if (!(CAMPOS_EDITABLES as readonly string[]).includes(campo)) {
      throw new ApiError(`El campo ${campo} no está permitido`, 400);
    }
  }

  const input: MetaUpdateInput = {};
  if (value.horasSemanales !== undefined) {
    input.horasSemanales = parseNumero(value.horasSemanales, "horasSemanales");
  }
  if (value.diasPorSemana !== undefined) {
    input.diasPorSemana = parseNumero(value.diasPorSemana, "diasPorSemana");
  }
  if (value.hitos !== undefined) {
    input.hitos = parseHitos(value.hitos);
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError("Debe indicar horasSemanales, diasPorSemana y/o hitos", 400);
  }
  return input;
}

export const crear: RequestHandler = async (request, response, next) => {
  try {
    const meta = await crearMeta(parseNuevaMeta(request.body));
    response.status(201).json({ meta, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const obtener: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    const meta = await obtenerMeta(request.params.id);
    response.status(200).json({ meta, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const actualizar: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    const meta = await actualizarMeta(request.params.id, parseEdicionMeta(request.body));
    response.status(200).json({ meta, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const desactivar: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    const meta = await desactivarMeta(request.params.id);
    response.status(200).json({ meta, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const reactivar: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    const meta = await reactivarMeta(request.params.id);
    response.status(200).json({ meta, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};
