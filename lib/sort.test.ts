import { describe, expect, it } from 'vitest'
import type { Product } from './catalogue'
import { applySort } from './sort'

const p = (id: number, price: number, discountPrice: number | null = null) =>
	({ id, price, discountPrice } as Product)

describe('applySort', () => {
	const items = [p(1, 900), p(2, 300, 250), p(3, 1200)]

	it('sorts ascending by current price by default', () => {
		expect(applySort(items).map(x => x.id)).toEqual([2, 1, 3])
	})

	it('sorts descending when requested', () => {
		expect(applySort(items, 'price-desc').map(x => x.id)).toEqual([3, 1, 2])
	})

	it('does not mutate the input array', () => {
		const copy = [...items]
		applySort(items, 'price-desc')
		expect(items).toEqual(copy)
	})
})
