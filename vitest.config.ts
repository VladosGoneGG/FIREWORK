import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.js on purpose: that file configures the old
// app's production build only. Tests span both apps (src/ and lib/), and
// only the new app uses the "@/*" path alias declared in tsconfig.json —
// Vitest resolves modules via Vite, not the TypeScript compiler, so it
// needs that alias spelled out here rather than picked up automatically.
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('.', import.meta.url)),
		},
	},
})
