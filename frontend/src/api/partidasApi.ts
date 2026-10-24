import type {
  PartidasListResponse,
  Partida,
  PartidaInput,
  PartidaResponse,
  PartidaListado,
} from '../types';
import { jsonRequest, requestJson, requestVoid } from './httpClient';

export async function listarPartidas(): Promise<PartidaListado[]> {
  const response = await requestJson<PartidasListResponse>('/api/partidas');
  return response.partidas;
}

export async function crearPartida(input: PartidaInput): Promise<Partida> {
  const response = await requestJson<PartidaResponse>(
    '/api/partidas',
    jsonRequest('POST', input),
  );
  return response.partida;
}

export function eliminarPartida(id: string): Promise<void> {
  return requestVoid(`/api/partidas/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
