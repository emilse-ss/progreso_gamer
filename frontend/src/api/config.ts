const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error(
    'Configuración inválida: falta VITE_API_URL. Define esta variable en frontend/.env.',
  );
}

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
