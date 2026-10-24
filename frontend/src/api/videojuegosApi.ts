import type {
  LogroInput,
  LogroUpdateInput,
  PartidaListado,
  PartidasListResponse,
  Videojuego,
  VideojuegoFilters,
  VideojuegoInput,
  VideojuegosListResponse,
  VideojuegoResumenResponse,
  VideojuegoResponse,
  VideojuegoUpdateInput,
} from '../types';
import { jsonRequest, requestJson, requestVoid } from './httpClient';

export async function listarVideojuegos(
  filtros: VideojuegoFilters = {},
): Promise<Videojuego[]> {
  const query = new URLSearchParams();
  if (filtros.plataforma) query.set('plataforma', filtros.plataforma);
  if (filtros.genero) query.set('genero', filtros.genero);
  if (filtros.estado) query.set('estado', filtros.estado);

  const queryString = query.size > 0 ? `?${query.toString()}` : '';
  const response = await requestJson<VideojuegosListResponse>(
    `/api/videojuegos${queryString}`,
  );
  return response.videojuegos;
}

export async function obtenerVideojuego(id: string): Promise<Videojuego> {
  const response = await requestJson<VideojuegoResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}`,
  );
  return response.videojuego;
}

export async function crearVideojuego(
  input: VideojuegoInput,
): Promise<Videojuego> {
  const response = await requestJson<VideojuegoResponse>(
    '/api/videojuegos',
    jsonRequest('POST', input),
  );
  return response.videojuego;
}

export async function actualizarVideojuego(
  id: string,
  input: VideojuegoUpdateInput,
): Promise<Videojuego> {
  const response = await requestJson<VideojuegoResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}`,
    jsonRequest('PUT', input),
  );
  return response.videojuego;
}

export function eliminarVideojuego(id: string): Promise<void> {
  return requestVoid(`/api/videojuegos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function obtenerResumenVideojuego(
  id: string,
): Promise<VideojuegoResumenResponse> {
  return requestJson<VideojuegoResumenResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}/resumen`,
  );
}

export async function listarPartidasDeVideojuego(
  id: string,
): Promise<PartidaListado[]> {
  const response = await requestJson<PartidasListResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}/partidas`,
  );
  return response.partidas;
}

export async function agregarLogro(
  id: string,
  input: LogroInput,
): Promise<Videojuego> {
  const response = await requestJson<VideojuegoResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}/logros`,
    jsonRequest('POST', input),
  );
  return response.videojuego;
}

export async function actualizarLogro(
  id: string,
  logroId: string,
  input: LogroUpdateInput,
): Promise<Videojuego> {
  const response = await requestJson<VideojuegoResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}/logros/${encodeURIComponent(logroId)}`,
    jsonRequest('PATCH', input),
  );
  return response.videojuego;
}

export async function eliminarLogro(
  id: string,
  logroId: string,
): Promise<Videojuego> {
  const response = await requestJson<VideojuegoResponse>(
    `/api/videojuegos/${encodeURIComponent(id)}/logros/${encodeURIComponent(logroId)}`,
    { method: 'DELETE' },
  );
  return response.videojuego;
}
