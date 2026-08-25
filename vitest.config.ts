import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.js on purpose: that file configures the old
// app's production build only. Tests span both apps (src/ and lib/), and
// only the new app uses the "@/*" path alias declared in tsconfig.json —
// Vitest resolves modules via Vite, not the TypeScript compiler, so it
// needs that alias spelled out here rather than picked up automatically.
export default defineConfig({
	test: {
		setupFiles: ['./lib/test/setup.ts'],
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('.', import.meta.url)),
			// The `server-only` package deliberately throws when imported
			// outside a server bundle — Next.js aliases it to a no-op for its
			// own server compilation, and tests need the same treatment or
			// every file that imports it (lib/cart/pricing.ts, and later the
			// checkout Server Action) becomes untestable.
			'server-only': fileURLToPath(new URL('./lib/test/server-only-noop.ts', import.meta.url)),
		},
	},
})
