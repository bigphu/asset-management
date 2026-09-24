/**
 * Thin fetch wrapper that feature `api/` modules build on. The base URL,
 * headers and error handling live only here.
 *
 * The browser always calls the same-origin `/api` prefix: the Vite dev server
 * proxies it in development, and the nginx gateway proxies it in Docker
 * (`gateway/templates/default.conf.template`). Both forward to the Express
 * backend's `/api` router (`backend/api/index.js`).
 */

import { API_BASE_URL } from './config'

/** Per-field messages from DTO validation (ADR-0005), keyed by request field name. */
export type FieldErrors = Record<string, string>

/** Error body every backend `/api` endpoint returns — mirrors `backend/api/errors.js`. */
interface ErrorEnvelope {
  error: { code: string; message: string; fields?: FieldErrors }
}

export class ApiError extends Error {
  status: number
  /** Machine-readable code, e.g. `VALIDATION_FAILED`, `DUPLICATE_TAG`, `NOT_IMPLEMENTED`. */
  code: string
  fields?: FieldErrors

  constructor(message: string, status: number, code: string, fields?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

/** Offset/limit page returned by list endpoints (ADR-0003). */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

type QueryValue = string | number | boolean | null | undefined

/** An array value repeats its key (`type=A&type=B`), which the API reads as "any of". */
export type QueryParams = Record<string, QueryValue | QueryValue[]>

function buildUrl(path: string, query?: QueryParams): string {
  const url = `${API_BASE_URL}${path}`
  if (!query) return url

  const params = new URLSearchParams()
  for (const [key, raw] of Object.entries(query)) {
    for (const value of Array.isArray(raw) ? raw : [raw]) {
      // Drop empty filters so `?type=&status=` never reaches the server.
      if (value === undefined || value === null || value === '') continue
      params.append(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

function isErrorEnvelope(body: unknown): body is ErrorEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as ErrorEnvelope).error?.message === 'string'
  )
}

async function toApiError(res: Response, path: string): Promise<ApiError> {
  const body: unknown = await res.json().catch(() => null)
  if (isErrorEnvelope(body)) {
    const { message, code, fields } = body.error
    return new ApiError(message, res.status, code, fields)
  }
  return new ApiError(`Request to ${path} failed`, res.status, 'HTTP_ERROR')
}

async function send(path: string, init: RequestInit & { query?: QueryParams } = {}) {
  const { query, headers, ...rest } = init
  const hasBody = rest.body !== undefined

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
    })
  } catch {
    // DNS failure, offline, proxy target down in dev, CORS, …
    throw new ApiError('Could not reach the server', 0, 'NETWORK_ERROR')
  }

  if (!res.ok) throw await toApiError(res, path)
  return res
}

async function request<T>(path: string, init?: RequestInit & { query?: QueryParams }): Promise<T> {
  const res = await send(path, init)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function filenameFrom(res: Response, fallback: string): string {
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  return match ? decodeURIComponent(match[1]) : fallback
}

export const apiClient = {
  get: <T>(path: string, query?: QueryParams) => request<T>(path, { query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),

  /**
   * POSTs a JSON body and returns the binary response — for the synchronous
   * Excel export (ADR-0007). The filename comes from `Content-Disposition`.
   */
  download: async (path: string, body: unknown, fallbackName: string) => {
    const res = await send(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { Accept: 'application/octet-stream' },
    })
    return {
      blob: await res.blob(),
      filename: filenameFrom(res, fallbackName),
      headers: res.headers,
    }
  },
}

/**
 * One line of user-facing text for any error a query or mutation throws.
 * Field messages (ADR-0005) are appended so nothing the server said is lost
 * when the caller has no per-field place to show them.
 */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const fields = Object.entries(error.fields ?? {})
      // DUPLICATE_TAG/DUPLICATE_NAME repeat the message on their field.
      .filter(([, message]) => message !== error.message)
      .map(([field, message]) => `${field}: ${message}`)
    return fields.length ? `${error.message} — ${fields.join('; ')}` : error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}
