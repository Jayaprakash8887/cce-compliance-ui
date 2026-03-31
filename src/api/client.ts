import type { ErrorResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8060';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ErrorResponse,
  ) {
    super(body.message);
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const fullPath = `${BASE_URL}/v1/compliance${path}`;
  const url = BASE_URL ? new URL(fullPath) : new URL(fullPath, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers: Record<string, string> = { 'Accept': 'application/json' };

  if (import.meta.env.VITE_AUTH_ENABLED === 'true') {
    const token = import.meta.env.VITE_AUTH_TOKEN || sessionStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    const body = await res.json().catch(() => {
      console.warn(`[api] Non-JSON error response from ${path}: ${res.status} ${res.statusText}`);
      return {
        status: res.status,
        error: res.statusText,
        message: `HTTP ${res.status}`,
        path: path,
        timestamp: new Date().toISOString(),
        fieldErrors: null,
      };
    });
    throw new ApiError(res.status, body);
  }

  return res.json();
}
