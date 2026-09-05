import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
const isProd = process.env.NODE_ENV === 'production'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Third arg '' loads ALL vars from .env (not just VITE_-prefixed ones).
	// This object only exists in this Node config file — it is never sent
	// to the client, so DEV_API_KEY never reaches the browser bundle.
	const env = loadEnv(mode, process.cwd(), '')
	const apiTarget = env.DEV_API_URL || 'http://localhost:3000'
	const apiKey = env.DEV_API_KEY || ''

	return {
		plugins: [react(), tailwindcss()],
		// GitHub Pages serves this as a project site under /FIREWORK/; the VPS
		// deploy serves it from the domain root, so it overrides via build arg.
		base: env.VITE_BASE_PATH || (isProd ? '/FIREWORK/' : '/'),
		server: {
			proxy: {
				// Browser calls relative /api/products; dev proxy forwards it to
				// the real Express route and attaches the Bearer token itself —
				// in production a reverse proxy does this same job instead.
				'/api': {
					target: apiTarget,
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, '/api/v1'),
					headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
				},
				// Public route on the API, no auth header needed — proxied as-is.
				'/downloads': {
					target: apiTarget,
					changeOrigin: true,
				},
			},
		},
	}
})
