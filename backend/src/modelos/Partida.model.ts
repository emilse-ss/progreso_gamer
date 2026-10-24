import { Document, Schema, Types, model } from "mongoose";

export interface PartidaInput {
  videojuego: string;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
}

export interface PartidaDocument extends Document {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partidaSchema = new Schema<PartidaDocument>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "El videojuego es obligatorio"]
    },
    fecha: {
      type: Date,
      required: [true, "La fecha de la partida es obligatoria"]
    },
    duracionMinutos: {
      type: Number,
      required: [true, "La duración de la partida es obligatoria"],
      min: [Number.MIN_VALUE, "La duración debe ser mayor que cero"]
    },
    porcentajeAvance: {
      type: Number,
      min: [0, "El porcentaje de avance no puede ser menor que cero"],
      max: [100, "El porcentaje de avance no puede ser mayor que 100"]
    },
    notas: {
      type: String
    }
  },
  { timestamps: true }
);

const Partida = model<PartidaDocument>("Partida", partidaSchema);

export default Partida;
