import { Document, Schema, Types, model } from "mongoose";

export interface PartidaInput {
  videojuego: string;
  fecha: Date;
  duracionMinutos: number;
  /** Obligatorio en las partidas nuevas (R-18); el documento lo deja opcional por los datos antiguos. */
  porcentajeAvance: number;
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
      // Segunda defensa del rango de R-22. Solo se valida al guardar: las partidas antiguas
      // fuera de rango se conservan (CA-11.5).
      min: [5, "La duración debe estar entre 5 y 1440 minutos"],
      max: [1440, "La duración debe estar entre 5 y 1440 minutos"]
    },
    porcentajeAvance: {
      type: Number,
      // Obligatorio en las partidas nuevas (R-18, D-03). Mongoose valida al guardar, así que
      // las partidas antiguas sin avance se siguen leyendo.
      required: [true, "El porcentaje de avance es obligatorio"],
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
