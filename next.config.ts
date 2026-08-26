import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// A minimal, self-contained server bundle (only the files actually
	// needed at runtime, node_modules pruned to production deps it
	// resolves) — see Dockerfile, which copies exactly this output rather
	// than shipping the whole repo + full node_modules into the image.
	output: 'standalone',
	images: {
		// The restored brand icons/placeholder art are all first-party SVGs
		// under public/SVG — Next's image optimizer refuses to serve SVG
		// unless explicitly allowed. CSP/sandbox flags are Next's own
		// documented mitigation for the one real risk (an SVG could embed
		// script) when doing so.
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
}

export default nextConfig
