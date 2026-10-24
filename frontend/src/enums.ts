export const PLATAFORMAS = [
  'PC',
  'PlayStation',
  'Xbox',
  'Switch',
  'Movil',
] as const;

export const GENEROS = [
  'accion',
  'rol',
  'estrategia',
  'puzzle',
  'deportes',
  'otro',
] as const;

export const ESTADOS = [
  'jugando',
  'pausado',
  'completado',
  'abandonado',
] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type EstadoVideojuego = (typeof ESTADOS)[number];
