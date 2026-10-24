import { Document, Schema, model, Types } from "mongoose";

export const PLATAFORMAS = [
  "PC",
  "PlayStation",
  "Xbox",
  "Switch",
  "Movil"
] as const;

export const GENEROS = [
  "accion",
  "rol",
  "estrategia",
  "puzzle",
  "deportes",
  "otro"
] as const;

export const ESTADOS = [
  "jugando",
  "pausado",
  "completado",
  "abandonado"
] as const;

export interface LogroInput {
  nombre: string;
  obtenido?: boolean;
}

export interface VideojuegoInput {
  nombre: string;
  plataforma?: (typeof PLATAFORMAS)[number];
  genero?: (typeof GENEROS)[number];
  estado?: (typeof ESTADOS)[number];
  logros?: LogroInput[];
}

export type VideojuegoUpdateInput = Partial<VideojuegoInput>;

export interface VideojuegoDocument extends Document {
  nombre: string;
  plataforma?: (typeof PLATAFORMAS)[number];
  genero?: (typeof GENEROS)[number];
  estado?: (typeof ESTADOS)[number];
  logros: Types.DocumentArray<LogroInput & { _id: Types.ObjectId }>;
  createdAt: Date;
  updatedAt: Date;
}

const logroSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del logro es obligatorio"],
      trim: true
    },
    obtenido: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const videojuegoSchema = new Schema<VideojuegoDocument>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del videojuego es obligatorio"],
      trim: true
    },
    plataforma: {
      type: String,
      enum: PLATAFORMAS
    },
    genero: {
      type: String,
      enum: GENEROS
    },
    estado: {
      type: String,
      enum: ESTADOS
    },
    logros: {
      type: [logroSchema],
      default: [],
      validate: {
        validator: (logros: unknown[]) => logros.length <= 50,
        message: "Un videojuego no puede tener más de 50 logros"
      }
    }
  },
  { timestamps: true }
);

const Videojuego = model<VideojuegoDocument>("Videojuego", videojuegoSchema);

export default Videojuego;
