import { Document, Schema, Types, model } from "mongoose";

export interface HitoInput {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface MetaInput {
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  hitos?: HitoInput[];
}

export type MetaUpdateInput = Partial<
  Pick<MetaInput, "horasSemanales" | "diasPorSemana" | "hitos">
>;

export interface HitoDocument {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface MetaDocument extends Document {
  videojuego: Types.ObjectId;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: HitoDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export const MAX_HITOS = 5;

// Los validadores solo usan el valor (no `this`), para que funcionen igual con
// save() y con findOneAndUpdate({ runValidators: true }) (D-08).
const enteroEntre = (minimo: number, maximo: number) => (valor: number) =>
  Number.isInteger(valor) && valor >= minimo && valor <= maximo;

const hitoSchema = new Schema<HitoDocument>(
  {
    descripcion: {
      type: String,
      trim: true,
      required: [true, "La descripción del hito es obligatoria"],
      maxlength: [100, "La descripción del hito admite como máximo 100 caracteres"]
    },
    porcentajeObjetivo: {
      type: Number,
      required: [true, "El objetivo del hito es obligatorio"],
      validate: {
        validator: enteroEntre(1, 100),
        message: "El objetivo de un hito debe ser un número entero entre 1 y 100"
      }
    }
  },
  { _id: false }
);

const metaSchema = new Schema<MetaDocument>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "El videojuego es obligatorio"]
    },
    horasSemanales: {
      type: Number,
      required: [true, "Las horas semanales son obligatorias"],
      validate: {
        validator: enteroEntre(1, 100),
        message: "Las horas semanales deben ser un número entero entre 1 y 100"
      }
    },
    diasPorSemana: {
      type: Number,
      required: [true, "Los días por semana son obligatorios"],
      validate: {
        validator: enteroEntre(1, 7),
        message: "Los días por semana deben ser un número entero entre 1 y 7"
      }
    },
    activa: {
      type: Boolean,
      default: true
    },
    hitos: {
      type: [hitoSchema],
      default: [],
      validate: {
        validator: (hitos: HitoDocument[]) => hitos.length <= MAX_HITOS,
        message: `Una meta admite como máximo ${MAX_HITOS} hitos`
      }
    }
  },
  { timestamps: true }
);

// Segunda defensa de R-13: como máximo una meta activa por videojuego.
metaSchema.index(
  { videojuego: 1 },
  {
    unique: true,
    partialFilterExpression: { activa: true },
    name: "meta_activa_unica_por_videojuego"
  }
);

const Meta = model<MetaDocument>("Meta", metaSchema);

export default Meta;
