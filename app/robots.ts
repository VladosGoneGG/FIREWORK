import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${siteUrl()}/sitemap.xml`,
	}
}

// Deploy target isn't decided yet (see the audit's deployment risk note —
// GitHub Pages can't serve this app once Server Actions exist). Falls back
// to a placeholder rather than guessing a production domain.
export function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}
