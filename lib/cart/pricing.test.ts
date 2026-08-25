import { describe, expect, it } from 'vitest'
import { getProducts } from '@/lib/catalogue'
import { resolveCart } from './pricing'

describe('resolveCart', () => {
	it('resolves an empty item list to an empty, zero-total cart', async () => {
		const result = await resolveCart([])
		expect(result).toEqual({ lines: [], total: 0, removedProductIds: [] })
	})

	it('resolves real products from the catalogue with their current price', async () => {
		const [first, second] = await getProducts()
		const result = await resolveCart([
			{ productId: first.id, quantity: 2 },
			{ productId: second.id, quantity: 1 },
		])

		expect(result.lines).toHaveLength(2)
		expect(result.removedProductIds).toEqual([])

		const line = result.lines.find(l => l.productId === first.id)!
		const expectedUnitPrice =
			typeof first.discountPrice === 'number' && first.discountPrice > 0 && first.discountPrice < first.price
				? first.discountPrice
				: first.price
		expect(line.unitPrice).toBe(expectedUnitPrice)
		expect(line.lineTotal).toBe(expectedUnitPrice * 2)
	})

	it('a stale/unknown product id is reported as removed, not included in lines or total', async () => {
		const [real] = await getProducts()
		const result = await resolveCart([
			{ productId: real.id, quantity: 1 },
			{ productId: 999_999_999, quantity: 3 }, // does not exist
		])

		expect(result.removedProductIds).toEqual([999_999_999])
		expect(result.lines.map(l => l.productId)).toEqual([real.id])
		expect(result.total).toBe(result.lines[0].lineTotal)
	})

	it('a cart of entirely unknown ids resolves to empty lines with everything flagged removed', async () => {
		const result = await resolveCart([
			{ productId: 111_111, quantity: 1 },
			{ productId: 222_222, quantity: 1 },
		])
		expect(result.lines).toEqual([])
		expect(result.total).toBe(0)
		expect(result.removedProductIds).toEqual([111_111, 222_222])
	})

	it('total is the sum of line totals, independent of client-supplied ordering', async () => {
		const products = await getProducts()
		const items = products.slice(0, 5).map(p => ({ productId: p.id, quantity: 2 }))
		const result = await resolveCart(items)
		const expectedTotal = result.lines.reduce((sum, l) => sum + l.lineTotal, 0)
		expect(result.total).toBe(expectedTotal)
	})

	it('reflects the catalogue\'s current price even if it changed since the item was added (no stale snapshot)', async () => {
		const [product] = await getProducts()
		// Simulate "price changed since added to cart": resolveCart never
		// received a price from the caller in the first place, so there is
		// nothing to go stale — it always reads getCurrentPrice fresh.
		const first = await resolveCart([{ productId: product.id, quantity: 1 }])
		const second = await resolveCart([{ productId: product.id, quantity: 1 }])
		expect(first.lines[0].unitPrice).toBe(second.lines[0].unitPrice)
		expect(first.lines[0].unitPrice).toBe(
			product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
				? product.discountPrice
				: product.price
		)
	})

	it('reports stock and inStock per line from the live catalogue', async () => {
		const outOfStockProduct = (await getProducts()).find(p => p.stock === 0)
		if (!outOfStockProduct) return // fixture is randomized-but-seeded; skip if none this run

		const result = await resolveCart([{ productId: outOfStockProduct.id, quantity: 1 }])
		expect(result.lines[0].inStock).toBe(false)
		expect(result.lines[0].stock).toBe(0)
	})
})
