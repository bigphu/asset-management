/**
 * Runtime settings read from Vite env vars (see `.env.example`). Kept in one
 * place so feature modules never touch `import.meta.env` directly.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
