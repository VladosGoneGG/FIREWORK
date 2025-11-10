import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
const isProd = process.env.NODE_ENV === 'production'
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: isProd ? '/FIREWORK/' : '/',
})
