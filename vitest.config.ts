import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Vitest resolves modules via Vite's resolver, not the TypeScript
// compiler, so the "@/*" path alias declared in tsconfig.json (which
// Next.js reads natively) needs to be spelled out here too rather than
// picked up automatically.
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
			// every file that imports it (lib/cart/pricing.ts, lib/cart/
			// schema.server.ts, lib/orders/*) becomes untestable.
			'server-only': fileURLToPath(new URL('./lib/test/server-only-noop.ts', import.meta.url)),
		},
	},
})
