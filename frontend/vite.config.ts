import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix: also read non-VITE_ vars, which stay out of the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Vite rejects unknown Host headers; allow Cloudflare quick tunnels plus any
      // extra hosts (e.g. a named-tunnel domain) listed comma-separated in DEV_ALLOWED_HOSTS.
      allowedHosts: [
        'asset.bigphu.io.vn',
        ...(env.DEV_ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean) ?? []),
      ],
      // Dev twin of the nginx gateway (gateway/templates/default.conf.template):
      // /api/* is forwarded with its prefix intact, so the browser always calls
      // same-origin `/api` and neither environment needs CORS.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
