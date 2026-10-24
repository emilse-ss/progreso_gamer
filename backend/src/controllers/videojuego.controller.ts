import { RequestHandler } from "express";
import {
  ESTADOS,
  GENEROS,
  LogroInput,
  PLATAFORMAS,
  VideojuegoInput,
  VideojuegoUpdateInput
} from "../modelos/Videojuego.model";
import { ApiError } from "../errors/ApiError";
import {
  agregarLogro,
  actualizarVideojuego,
  actualizarLogro as actualizarLogroServicio,
  crearVideojuego,
  eliminarLogro as eliminarLogroServicio,
  eliminarVideojuego,
  listarVideojuegos,
  obtenerResumen,
  obtenerVideojuego
} from "../services/videojuego.service";
import { listarPartidasPorVideojuego } from "../services/partida.service";

type IdParams = { id: string };
type LogroParams = { id: string; logroId: string };

interface LogroUpdateInput {
  nombre?: string;
  obtenido?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: unknown,
  values: readonly T[]
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function parseVideojuegoInput(value: unknown, partial: false): VideojuegoInput;
function parseVideojuegoInput(value: unknown, partial: true): VideojuegoUpdateInput;
function parseVideojuegoInput(
  value: unknown,
  partial: boolean
): VideojuegoInput | VideojuegoUpdateInput {
  if (!isRecord(value)) {
    throw new ApiError("El cuerpo debe ser un objeto JSON", 400);
  }

  const input: VideojuegoUpdateInput = {};

  if ("nombre" in value) {
    if (typeof value.nombre !== "string") {
      throw new ApiError("nombre debe ser una cadena de texto", 400);
    }
    input.nombre = value.nombre;
  } else if (!partial) {
    throw new ApiError("El nombre del videojuego es obligatorio", 400);
  }

  if ("plataforma" in value) {
    if (!isOneOf(value.plataforma, PLATAFORMAS)) {
      throw new ApiError("plataforma no es válida", 400);
    }
    input.plataforma = value.plataforma;
  }

  if ("genero" in value) {
    if (!isOneOf(value.genero, GENEROS)) {
      throw new ApiError("genero no es válido", 400);
    }
    input.genero = value.genero;
  }

  if ("estado" in value) {
    if (!isOneOf(value.estado, ESTADOS)) {
      throw new ApiError("estado no es válido", 400);
    }
    input.estado = value.estado;
  }

  if ("logros" in value) {
    if (!Array.isArray(value.logros)) {
      throw new ApiError("logros debe ser un arreglo", 400);
    }

    const logros: LogroInput[] = value.logros.map((item: unknown) => {
      if (!isRecord(item) || typeof item.nombre !== "string") {
        throw new ApiError("Cada logro debe incluir un nombre de texto", 400);
      }
      if ("obtenido" in item && typeof item.obtenido !== "boolean") {
        throw new ApiError("obtenido debe ser booleano", 400);
      }

      return {
        nombre: item.nombre,
        ...(typeof item.obtenido === "boolean" ? { obtenido: item.obtenido } : {})
      };
    });

    if (logros.length > 50) {
      throw new ApiError("Un videojuego no puede tener más de 50 logros", 400);
    }
    input.logros = logros;
  }

  return input as VideojuegoInput | VideojuegoUpdateInput;
}

function queryValue(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new ApiError(`El filtro ${field} debe ser un único valor`, 400);
  }
  return value;
}

function parseNuevoLogro(value: unknown): { nombre: string } {
  if (!isRecord(value) || typeof value.nombre !== "string") {
    throw new ApiError("El nombre del logro es obligatorio y debe ser texto", 400);
  }

  const unexpectedField = Object.keys(value).find((field) => field !== "nombre");
  if (unexpectedField) {
    throw new ApiError(`El campo ${unexpectedField} no está permitido para un logro`, 400);
  }

  return { nombre: value.nombre };
}

function parseActualizacionLogro(value: unknown): LogroUpdateInput {
  if (!isRecord(value)) {
    throw new ApiError("El cuerpo debe incluir nombre y/o obtenido", 400);
  }

  const input: LogroUpdateInput = {};
  if ("nombre" in value) {
    if (typeof value.nombre !== "string") {
      throw new ApiError("nombre del logro debe ser texto", 400);
    }
    input.nombre = value.nombre;
  }
  if ("obtenido" in value) {
    if (typeof value.obtenido !== "boolean") {
      throw new ApiError("obtenido debe ser booleano", 400);
    }
    input.obtenido = value.obtenido;
  }

  const unexpectedField = Object.keys(value).find(
    (field) => field !== "nombre" && field !== "obtenido"
  );
  if (unexpectedField) {
    throw new ApiError(`El campo ${unexpectedField} no está permitido para un logro`, 400);
  }
  if (Object.keys(input).length === 0) {
    throw new ApiError("Debe indicar nombre y/o obtenido para actualizar el logro", 400);
  }

  return input;
}

export const listar: RequestHandler = async (request, response, next) => {
  try {
    const videojuegos = await listarVideojuegos({
      plataforma: queryValue(request.query.plataforma, "plataforma"),
      genero: queryValue(request.query.genero, "genero"),
      estado: queryValue(request.query.estado, "estado")
    });

    response.status(200).json({
      total: videojuegos.length,
      videojuegos,
      requestId: response.locals.requestId
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const obtener: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    const videojuego = await obtenerVideojuego(request.params.id);
    response.status(200).json({ videojuego, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const resumen: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    const resultado = await obtenerResumen(request.params.id);
    response.status(200).json({
      ...resultado,
      requestId: response.locals.requestId
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const listarPartidas: RequestHandler<IdParams> = async (
  request,
  response,
  next
) => {
  try {
    const partidas = await listarPartidasPorVideojuego(request.params.id);
    response.status(200).json({
      total: partidas.length,
      partidas,
      requestId: response.locals.requestId
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const crear: RequestHandler = async (request, response, next) => {
  try {
    const input = parseVideojuegoInput(request.body, false);
    const videojuego = await crearVideojuego(input);
    response.status(201).json({ videojuego, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const actualizar: RequestHandler<IdParams> = async (
  request,
  response,
  next
) => {
  try {
    const input = parseVideojuegoInput(request.body, true);
    const videojuego = await actualizarVideojuego(request.params.id, input);
    response.status(200).json({ videojuego, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const eliminar: RequestHandler<IdParams> = async (request, response, next) => {
  try {
    await eliminarVideojuego(request.params.id);
    response.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
};

export const crearLogro: RequestHandler<IdParams> = async (
  request,
  response,
  next
) => {
  try {
    const videojuego = await agregarLogro(
      request.params.id,
      parseNuevoLogro(request.body)
    );
    response.status(201).json({ videojuego, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const actualizarLogro: RequestHandler<LogroParams> = async (
  request,
  response,
  next
) => {
  try {
    const videojuego = await actualizarLogroServicio(
      request.params.id,
      request.params.logroId,
      parseActualizacionLogro(request.body)
    );
    response.status(200).json({ videojuego, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};

export const borrarLogro: RequestHandler<LogroParams> = async (
  request,
  response,
  next
) => {
  try {
    const videojuego = await eliminarLogroServicio(
      request.params.id,
      request.params.logroId
    );
    response.status(200).json({ videojuego, requestId: response.locals.requestId });
  } catch (error: unknown) {
    next(error);
  }
};
