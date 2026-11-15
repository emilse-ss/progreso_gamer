import type { EstadoVideojuego, Genero, Plataforma } from './enums';

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface LogroInput {
  nombre: string;
  obtenido?: boolean;
}

export interface LogroUpdateInput {
  nombre?: string;
  obtenido?: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export interface VideojuegoInput {
  nombre: string;
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
  logros?: LogroInput[];
}

export type VideojuegoUpdateInput = Partial<VideojuegoInput>;

export interface VideojuegoFilters {
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
}

export interface PartidaInput {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
}

export interface Partida {
  _id: string;
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export type PartidaListado = Omit<Partida, 'videojuego'> & {
  videojuego: Videojuego;
};

export interface VideojuegoResumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

export interface VideojuegosListResponse {
  total: number;
  videojuegos: Videojuego[];
  requestId: string;
}

export interface PartidasListResponse {
  total: number;
  partidas: PartidaListado[];
  requestId: string;
}

export interface VideojuegoResponse {
  videojuego: Videojuego;
  requestId: string;
}

export interface PartidaResponse {
  partida: Partida;
  requestId: string;
}

export interface VideojuegoResumenResponse extends VideojuegoResumen {
  requestId: string;
}

// E2 · Metas y progreso semanal (spec frontend §3.1).

export interface Hito {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface HitoProgreso extends Hito {
  alcanzado: boolean;
}

export interface Meta {
  _id: string;
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  /** Ya vienen ordenados de menor a mayor objetivo. */
  hitos: Hito[];
  createdAt: string;
  updatedAt: string;
}

export interface MetaInput {
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  hitos: Hito[];
}

export type MetaUpdateInput = Partial<
  Pick<MetaInput, 'horasSemanales' | 'diasPorSemana' | 'hitos'>
>;

export interface MetaResponse {
  meta: Meta;
  requestId: string;
}

export interface MetasListResponse {
  total: number;
  metas: Meta[];
  requestId: string;
}

export interface ProgresoSemanal {
  /** Días "YYYY-MM-DD" en hora de Ecuador. */
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoProgreso[];
  metaCumplida: boolean | null;
}

export interface ProgresoSemanalResponse extends ProgresoSemanal {
  requestId: string;
}
