import mongoose from "mongoose";
import { ApiError } from "../errors/ApiError";
import Videojuego, {
  ESTADOS,
  GENEROS,
  LogroInput,
  PLATAFORMAS,
  VideojuegoInput,
  VideojuegoUpdateInput
} from "../modelos/Videojuego.model";
import Partida from "../modelos/Partida.model";

export type LogroUpdateInput = Partial<LogroInput>;

export interface VideojuegoFilters {
  plataforma?: string;
  genero?: string;
  estado?: string;
}

function assertValidId(id: string, field: string): void {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new ApiError(`El identificador de ${field} no tiene un formato válido`, 400);
  }
}

function assertEnumFilter(
  value: string | undefined,
  allowedValues: readonly string[],
  field: string
): void {
  if (value !== undefined && !allowedValues.includes(value)) {
    throw new ApiError(`El valor de ${field} no es válido`, 400);
  }
}

export async function listarVideojuegos(filters: VideojuegoFilters = {}) {
  const filtroBusqueda: VideojuegoFilters = {};
  const plataforma = filters.plataforma?.trim();
  const genero = filters.genero?.trim();
  const estado = filters.estado?.trim();

  if (plataforma) {
    assertEnumFilter(plataforma, PLATAFORMAS, "plataforma");
    filtroBusqueda.plataforma = plataforma;
  }
  if (genero) {
    assertEnumFilter(genero, GENEROS, "género");
    filtroBusqueda.genero = genero;
  }
  if (estado) {
    assertEnumFilter(estado, ESTADOS, "estado");
    filtroBusqueda.estado = estado;
  }

  return Videojuego.find(filtroBusqueda).sort({ nombre: 1 });
}

export async function obtenerVideojuego(id: string) {
  assertValidId(id, "videojuego");

  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  return videojuego;
}

export async function crearVideojuego(input: VideojuegoInput) {
  return Videojuego.create(input);
}

export async function actualizarVideojuego(
  id: string,
  input: VideojuegoUpdateInput
) {
  assertValidId(id, "videojuego");

  const videojuego = await Videojuego.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  return videojuego;
}

export async function eliminarVideojuego(id: string): Promise<void> {
  assertValidId(id, "videojuego");

  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  await Partida.deleteMany({ videojuego: videojuego._id });
  await videojuego.deleteOne();
}

export interface VideojuegoResumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: Date | null;
  porcentajeAvanceActual: number;
}

export async function obtenerResumen(id: string): Promise<VideojuegoResumen> {
  assertValidId(id, "videojuego");

  const videojuegoExiste = await Videojuego.exists({ _id: id });
  if (!videojuegoExiste) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  const [resumen] = await Partida.aggregate<{
    totalPartidas: number;
    horasTotales: number;
    ultimaPartida: Date;
    porcentajeAvanceActual: number;
  }>([
    { $match: { videojuego: new mongoose.Types.ObjectId(id) } },
    { $sort: { fecha: -1, _id: -1 } },
    {
      $group: {
        _id: null,
        totalPartidas: { $sum: 1 },
        minutosTotales: { $sum: "$duracionMinutos" },
        ultimaPartida: { $first: "$fecha" },
        porcentajeAvanceActual: {
          $first: { $ifNull: ["$porcentajeAvance", 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalPartidas: 1,
        horasTotales: {
          $round: [{ $divide: ["$minutosTotales", 60] }, 1]
        },
        ultimaPartida: 1,
        porcentajeAvanceActual: 1
      }
    }
  ]);

  if (!resumen) {
    return {
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: 0
    };
  }

  return resumen;
}

export async function agregarLogro(id: string, input: LogroInput) {
  assertValidId(id, "videojuego");

  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  if (videojuego.logros.length >= 50) {
    throw new ApiError("Un videojuego no puede tener más de 50 logros", 400);
  }

  videojuego.logros.push({
    nombre: input.nombre,
    obtenido: false
  });
  await videojuego.save();
  return videojuego;
}

export async function actualizarLogro(
  id: string,
  logroId: string,
  input: LogroUpdateInput
) {
  assertValidId(id, "videojuego");
  assertValidId(logroId, "logro");

  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  const logro = videojuego.logros.id(logroId);
  if (!logro) {
    throw new ApiError("Logro no encontrado", 404);
  }

  if (input.nombre !== undefined) {
    logro.nombre = input.nombre;
  }
  if (input.obtenido !== undefined) {
    logro.obtenido = input.obtenido;
  }

  await videojuego.save();
  return videojuego;
}

export async function eliminarLogro(id: string, logroId: string) {
  assertValidId(id, "videojuego");
  assertValidId(logroId, "logro");

  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError("Videojuego no encontrado", 404);
  }

  const logro = videojuego.logros.id(logroId);
  if (!logro) {
    throw new ApiError("Logro no encontrado", 404);
  }

  videojuego.logros.pull(logro._id);
  await videojuego.save();
  return videojuego;
}
