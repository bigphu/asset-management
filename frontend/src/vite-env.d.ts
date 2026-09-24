/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base path for API calls; defaults to `/api` (proxied by Vite in dev, nginx in Docker). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
