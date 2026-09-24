/**
 * Thin fetch wrapper feature `api/` modules build on. Centralizing this here
 * means the base URL, headers, and error handling only need to change in one
 * place once the real backend (ADR-0006, server-side) exists.
 *
 * Nothing calls this yet with a live endpoint — feature api modules currently
 * serve mock data (see e.g. `features/assets/api/assets.api.ts`) because the
 * backend is not implemented yet. Point `VITE_API_URL` at the real API and
 * swap the mock functions for real `apiClient` calls when it lands.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status)
  }

  if (res.status === 204) return undefined as T

  return (await res.json()) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
