import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Lints the old Vite app (src/) only. The Next.js app (app/, lib/,
// content/) has its own separate config — see eslint.next.config.mjs and
// the "lint:next" script — kept apart deliberately rather than merged into
// one FlatConfigArray: eslint-config-next's presets assume they compose
// only among themselves, and combining them with an unrelated project's
// config here produced conflicting plugin registrations. Two independent,
// well-supported configs are simpler than fighting that.
export default defineConfig([
  globalIgnores(['dist', '.next', 'out']),
  {
    files: ['**/*.{js,jsx}'],
    // eslint-plugin-react-hooks@7's "recommended-latest" preset declares
    // `plugins: ['react-hooks']` (a name-only shorthand) instead of
    // registering the plugin object, so plain `extends` can't resolve it —
    // register the plugin here directly instead.
    //
    // v7 also adds many new rules beyond rules-of-hooks/exhaustive-deps
    // (static-components, use-memo, set-state-in-effect, etc.) aimed at
    // React Compiler-era code. This app was upgraded to v7 only so its
    // version matches what eslint-config-next bundles for the separate
    // Next.js config (see eslint.next.config.mjs) — applying those newer,
    // stricter rules retroactively to the untouched Vite app is out of
    // scope here, so only the two rules the original config used are kept.
    plugins: { 'react-hooks': reactHooks },
    extends: [js.configs.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
