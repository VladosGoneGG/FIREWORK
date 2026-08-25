// The single canonical filter engine. The old app had three: one in
// productsSlice.js (used by mobile), one in utils/filters.js (used by
// desktop), and one dead one in useOverlayFilters.js. They disagreed on
// normalization (ё/е folding), on what "types" matched against, and most
// visibly on "power" (see content/products.ts for the investigation this
// resolved). One typed, pure, independently-tested module replaces all
// three — see the business-rules table in the audit report for the
// contract each piece below is locking in.

import { getCurrentPrice, hasValidDiscount, type Product } from './catalogue'

export type PowerBucket = 'слабый' | 'средний' | 'мощный'

export interface Filters {
	search?: string
	category?: string // category or subcategory name; 'all' or '' means no filter
	price?: { min?: number; max?: number }
	duration?: { min?: number; max?: number }
	manufacturers?: string[]
	shots?: number[] // 1 | 2 | 3 | 4 | 50 | 100 — see shotsMatches
	power?: PowerBucket[]
	ignitionType?: string[]
	view?: string[]
	size?: string[]
	tags?: string[] // product must have ALL of these
	inStockOnly?: boolean
	hasCertificate?: boolean
}

const norm = (s: unknown): string =>
	String(s ?? '')
		.trim()
		.toLowerCase()
		.replaceAll('ё', 'е')

/**
 * Canonical power bucket, derived from caliber — see content/products.ts
 * for why the (removed) stored `power` field was rejected in favor of
 * this. Thresholds match the mobile engine's, the one of the two old
 * implementations that was actually deriving from a real attribute.
 */
export function powerBucket(product: Pick<Product, 'caliber'>): PowerBucket {
	const cal = product.caliber
	if (cal < 1.0) return 'слабый'
	if (cal <= 1.25) return 'средний'
	return 'мощный'
}

/**
 * Shots-count bucketing, per the audit's documented business rule:
 * 1/2/3/4 match exactly; 50 means the range [50, 100); 100 means >= 100.
 */
function shotsMatches(selected: Set<number>, shots: number): boolean {
	if (selected.size === 0) return true
	if (selected.has(1) && shots === 1) return true
	if (selected.has(2) && shots === 2) return true
	if (selected.has(3) && shots === 3) return true
	if (selected.has(4) && shots === 4) return true
	if (selected.has(50) && shots >= 50 && shots < 100) return true
	if (selected.has(100) && shots >= 100) return true
	return false
}

function inRange(value: number, range?: { min?: number; max?: number }): boolean {
	if (!range) return true
	if (typeof range.min === 'number' && value < range.min) return false
	if (typeof range.max === 'number' && value > range.max) return false
	return true
}

function matchesSearch(product: Product, query: string): boolean {
	if (!query) return true
	const haystack = [
		product.name,
		product.description,
		product.category,
		product.subcategory,
		product.manufacturer,
		...product.tags,
	]
		.map(norm)
		.join(' | ')
	return haystack.includes(query)
}

export function applyFilters(products: Product[], filters: Filters = {}): Product[] {
	const query = norm(filters.search)
	const category = norm(filters.category)
	const manufacturers = new Set((filters.manufacturers ?? []).map(norm))
	const shots = new Set(filters.shots ?? [])
	const power = new Set(filters.power ?? [])
	const ignitionType = new Set((filters.ignitionType ?? []).map(norm))
	const view = new Set((filters.view ?? []).map(norm))
	const size = new Set((filters.size ?? []).map(norm))
	const tags = new Set((filters.tags ?? []).map(norm))

	return products.filter(product => {
		if (!matchesSearch(product, query)) return false

		if (category && category !== 'all') {
			const productCategory = norm(product.category)
			const productSubcategory = norm(product.subcategory)
			if (category !== productCategory && category !== productSubcategory) return false
		}

		if (!inRange(getCurrentPrice(product), filters.price)) return false
		if (!inRange(product.durationSec, filters.duration)) return false

		if (manufacturers.size && !manufacturers.has(norm(product.manufacturer))) return false
		if (shots.size && !shotsMatches(shots, product.shots)) return false
		if (power.size && !power.has(powerBucket(product))) return false
		if (ignitionType.size && !ignitionType.has(norm(product.ignitionType))) return false
		if (view.size && !view.has(norm(product.view))) return false
		if (size.size && !size.has(norm(product.size))) return false

		if (filters.inStockOnly && product.stock <= 0) return false
		if (filters.hasCertificate && !product.certificateNumber.trim()) return false

		if (tags.size) {
			const productTags = new Set(product.tags.map(norm))
			for (const t of tags) if (!productTags.has(t)) return false
		}

		return true
	})
}

export function filterDiscounted(products: Product[]): Product[] {
	return products.filter(hasValidDiscount)
}
