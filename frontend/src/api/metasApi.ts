import type {
  Meta,
  MetaInput,
  MetaResponse,
  MetasListResponse,
  MetaUpdateInput,
} from '../types';
import { jsonRequest, requestJson } from './httpClient';

const rutaMeta = (id: string) => `/api/metas/${encodeURIComponent(id)}`;

export async function crearMeta(input: MetaInput): Promise<Meta> {
  const response = await requestJson<MetaResponse>(
    '/api/metas',
    jsonRequest('POST', input),
  );
  return response.meta;
}

export async function obtenerMeta(id: string): Promise<Meta> {
  const response = await requestJson<MetaResponse>(rutaMeta(id));
  return response.meta;
}

/** Metas de un videojuego: la activa primero y después las inactivas. */
export async function listarMetasDeVideojuego(
  videojuegoId: string,
): Promise<Meta[]> {
  const response = await requestJson<MetasListResponse>(
    `/api/videojuegos/${encodeURIComponent(videojuegoId)}/metas`,
  );
  return response.metas;
}

export async function actualizarMeta(
  id: string,
  input: MetaUpdateInput,
): Promise<Meta> {
  const response = await requestJson<MetaResponse>(
    rutaMeta(id),
    jsonRequest('PATCH', input),
  );
  return response.meta;
}

export async function desactivarMeta(id: string): Promise<Meta> {
  const response = await requestJson<MetaResponse>(
    `${rutaMeta(id)}/desactivar`,
    { method: 'PATCH' },
  );
  return response.meta;
}

export async function reactivarMeta(id: string): Promise<Meta> {
  const response = await requestJson<MetaResponse>(
    `${rutaMeta(id)}/reactivar`,
    { method: 'PATCH' },
  );
  return response.meta;
}
