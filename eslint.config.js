import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { globalIgnores } from 'eslint/config'

// eslint-config-next only enables a handful of jsx-a11y rules on its own
// (alt-text, aria-props/proptypes, aria-unsupported-elements,
// role-has-required-aria-props, role-supports-aria-props) — not the full
// recommended set. Pulling in jsx-a11y's own recommended rules (label-
// has-associated-control, click-events-have-key-events, no-static-
// element-interactions, anchor-is-valid, etc.) for real coverage.
//
// Not spread in directly: jsxA11y.flatConfigs.recommended registers its
// own "jsx-a11y" plugin object, and even though it resolves to the same
// installed package eslint-config-next already uses, ESM/CJS interop
// gives it a distinct wrapper identity — flat config rejects two
// registrations of the same plugin key with different object references.
// Applying just the rule set to the same "next" block's file glob avoids
// registering the plugin a second time.
const nextBlock = nextCoreWebVitals.find(c => c.plugins?.['jsx-a11y'])

const config = [
	globalIgnores(['.next', 'out']),
	...nextCoreWebVitals,
	{
		files: nextBlock?.files,
		rules: jsxA11y.flatConfigs.recommended.rules,
	},
]

export default config
