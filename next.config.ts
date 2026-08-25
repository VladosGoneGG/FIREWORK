import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// A minimal, self-contained server bundle (only the files actually
	// needed at runtime, node_modules pruned to production deps it
	// resolves) — see Dockerfile, which copies exactly this output rather
	// than shipping the whole repo + full node_modules into the image.
	output: 'standalone',
}

export default nextConfig
