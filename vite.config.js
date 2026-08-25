import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
const isProd = process.env.NODE_ENV === 'production'
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: isProd ? '/FIREWORK/' : '/',
	// The repo also has a root postcss.config.mjs for the Next.js app being
	// migrated to (app/, lib/, content/). Vite auto-loads any postcss config
	// it finds, which would double-run Tailwind's PostCSS plugin on top of
	// @tailwindcss/vite above. Pin an empty postcss config so this app's CSS
	// pipeline is unaffected by files that exist only for the Next.js side.
	css: { postcss: { plugins: [] } },
})
