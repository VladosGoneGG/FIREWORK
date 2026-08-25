import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

// Lints only the Next.js app (app/, lib/, content/) — see eslint.config.js
// for why this is a separate config rather than merged with the old Vite
// app's: eslint-config-next's blocks are designed to compose only among
// themselves, and this repo's *.ts/*.tsx files exist exclusively outside
// src/, so scoping isn't even necessary — used as-is.
export default nextCoreWebVitals
