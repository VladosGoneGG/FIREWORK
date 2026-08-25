import { describe, expect, it } from 'vitest'
import { getCurrentPrice, getProducts, type Product } from './catalogue'
import { applyFilters, powerBucket } from './filters'

const product = (overrides: Partial<Product>): Product => ({
	id: 1,
	slug: 'test-1',
	name: 'Тестовый салют',
	manufacturer: 'PIROFF',
	category: 'салюты',
	subcategory: '1.2″',
	shots: 25,
	caliber: 1.2,
	durationSec: 60,
	effectsCount: 5,
	certificateNumber: 'ЕАЭС RU C-RU.АЮ.В.12345/24',
	stock: 10,
	price: 1000,
	discountPrice: null,
	images: [],
	video: null,
	description: 'описание',
	ignitionType: 'терочный',
	view: 'жуки',
	size: 'большой',
	tags: ['салюты', '1.2″', 'piroff'],
	...overrides,
})

describe('powerBucket (canonical, calibre-derived — see content/products.ts)', () => {
	it('buckets by the documented thresholds', () => {
		expect(powerBucket({ caliber: 0.9 })).toBe('слабый')
		expect(powerBucket({ caliber: 0.99 })).toBe('слабый')
		expect(powerBucket({ caliber: 1.0 })).toBe('средний')
		expect(powerBucket({ caliber: 1.25 })).toBe('средний')
		expect(powerBucket({ caliber: 1.26 })).toBe('мощный')
		expect(powerBucket({ caliber: 2.0 })).toBe('мощный')
	})
})

describe('getCurrentPrice (price precedence business rule)', () => {
	it('prefers a valid discount over the base price', () => {
		expect(getCurrentPrice({ price: 1000, discountPrice: 700 })).toBe(700)
	})
	it('falls back to price when discountPrice is null', () => {
		expect(getCurrentPrice({ price: 1000, discountPrice: null })).toBe(1000)
	})
	it('ignores a discount that is not actually lower', () => {
		expect(getCurrentPrice({ price: 1000, discountPrice: 1000 })).toBe(1000)
		expect(getCurrentPrice({ price: 1000, discountPrice: 1500 })).toBe(1000)
	})
})

describe('applyFilters', () => {
	const items = [
		product({ id: 1, category: 'салюты', subcategory: '1.2″', price: 500, manufacturer: 'PIROFF', shots: 2, caliber: 0.9, stock: 5, certificateNumber: 'X' }),
		product({ id: 2, category: 'салюты', subcategory: '1.5″', price: 1500, manufacturer: 'Joker', shots: 60, caliber: 1.5, stock: 0, certificateNumber: '' }),
		product({ id: 3, category: 'петарды', subcategory: 'мини', price: 300, manufacturer: 'PIROFF', shots: 100, caliber: 1.1, stock: 3, certificateNumber: 'Y' }),
	]

	it('"all"/empty category means no category filter', () => {
		expect(applyFilters(items, { category: 'all' })).toHaveLength(3)
		expect(applyFilters(items, { category: '' })).toHaveLength(3)
	})

	it('matches by category or subcategory name', () => {
		expect(applyFilters(items, { category: 'петарды' }).map(p => p.id)).toEqual([3])
		expect(applyFilters(items, { category: '1.5″' }).map(p => p.id)).toEqual([2])
	})

	it('filters by price range using the current (discounted) price', () => {
		expect(applyFilters(items, { price: { min: 400, max: 1000 } }).map(p => p.id)).toEqual([1])
	})

	it('filters by manufacturer', () => {
		expect(applyFilters(items, { manufacturers: ['piroff'] }).map(p => p.id)).toEqual([1, 3])
	})

	it('shots bucket: 50 means [50,100), 100 means >=100', () => {
		expect(applyFilters(items, { shots: [50] }).map(p => p.id)).toEqual([2])
		expect(applyFilters(items, { shots: [100] }).map(p => p.id)).toEqual([3])
	})

	it('inStockOnly excludes zero-stock items', () => {
		expect(applyFilters(items, { inStockOnly: true }).map(p => p.id)).toEqual([1, 3])
	})

	it('hasCertificate excludes items without a certificate number', () => {
		expect(applyFilters(items, { hasCertificate: true }).map(p => p.id)).toEqual([1, 3])
	})

	it('power filter uses the calibre-derived bucket', () => {
		// id 1: caliber 0.9 -> слабый, id 3: caliber 1.1 -> средний, id 2: caliber 1.5 -> мощный
		expect(applyFilters(items, { power: ['слабый'] }).map(p => p.id)).toEqual([1])
		expect(applyFilters(items, { power: ['средний'] }).map(p => p.id)).toEqual([3])
		expect(applyFilters(items, { power: ['мощный'] }).map(p => p.id)).toEqual([2])
	})

	it('search matches name, category, subcategory, manufacturer, tags', () => {
		expect(applyFilters(items, { search: 'joker' }).map(p => p.id)).toEqual([2])
		expect(applyFilters(items, { search: 'петарды' }).map(p => p.id)).toEqual([3])
	})

	it('search normalizes ё/е so results are consistent regardless of which is typed', () => {
		const withYo = product({ id: 4, name: 'Ёлочный салют', category: 'фонтаны' })
		expect(applyFilters([withYo], { search: 'елочный' }).map(p => p.id)).toEqual([4])
		expect(applyFilters([withYo], { search: 'ёлочный' }).map(p => p.id)).toEqual([4])
	})

	it('combines filters with AND semantics', () => {
		expect(
			applyFilters(items, { category: 'салюты', inStockOnly: true }).map(p => p.id)
		).toEqual([1])
	})
})

describe('deterministic fixture (SSR safety)', () => {
	it('produces the same catalogue across repeated calls, in-process', async () => {
		const a = await getProducts()
		const b = await getProducts()
		expect(a).toEqual(b)
		expect(a.length).toBeGreaterThan(0)
	})

	it('every product has a unique, non-empty slug', async () => {
		const items = await getProducts()
		const slugs = items.map(p => p.slug)
		expect(new Set(slugs).size).toBe(slugs.length)
		expect(slugs.every(s => s.length > 0)).toBe(true)
	})
})
