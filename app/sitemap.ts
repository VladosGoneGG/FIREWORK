import type { MetadataRoute } from 'next'
import { getCategories, getProducts } from '@/lib/catalogue'
import { siteUrl } from './robots'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteUrl()
	const [products, categories] = await Promise.all([getProducts(), getCategories()])

	return [
		{ url: base, changeFrequency: 'daily', priority: 1 },
		{ url: `${base}/contacts`, changeFrequency: 'monthly', priority: 0.3 },
		{ url: `${base}/wholesale`, changeFrequency: 'monthly', priority: 0.3 },
		...categories
			.filter(c => c.slug !== 'all')
			.map(c => ({
				url: `${base}/category/${c.slug}`,
				changeFrequency: 'weekly' as const,
				priority: 0.7,
			})),
		...products.map(p => ({
			url: `${base}/product/${p.slug}`,
			changeFrequency: 'weekly' as const,
			priority: 0.5,
		})),
	]
}
