import { API_BASE_URL } from './config';
import { ApiError } from './ApiError';

interface ErrorResponseBody {
  error?: unknown;
  requestId?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requestIdFrom(body: unknown, response: Response): string | null {
  const bodyRequestId = isRecord(body) ? body.requestId : undefined;
  if (typeof bodyRequestId === 'string') {
    return bodyRequestId;
  }
  return response.headers.get('X-Request-Id');
}

function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  return isRecord(value);
}

function getHttpErrorMessage(body: unknown, status: number): string {
  if (
    isErrorResponseBody(body) &&
    typeof body.error === 'string' &&
    body.error.trim()
  ) {
    return body.error;
  }
  return `La solicitud falló (HTTP ${status}).`;
}

async function sendRequest(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      throw new ApiError(
        'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
        0,
        null,
      );
    }
    throw error;
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch (error: unknown) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }

    throw new ApiError(
      getHttpErrorMessage(errorBody, response.status),
      response.status,
      requestIdFrom(errorBody, response),
    );
  }

  return response;
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await sendRequest(path, init);
  if (response.status === 204) {
    throw new ApiError(
      'El servidor respondió sin contenido cuando se esperaba JSON.',
      response.status,
      requestIdFrom(undefined, response),
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      throw new ApiError(
        'El servidor devolvió una respuesta JSON inválida.',
        response.status,
        requestIdFrom(undefined, response),
      );
    }
    throw error;
  }
}

export async function requestVoid(
  path: string,
  init?: RequestInit,
): Promise<void> {
  await sendRequest(path, init);
}

export function jsonRequest(
  method: 'POST' | 'PUT' | 'PATCH',
  body: unknown,
): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
