import { describe, expect, it } from 'vitest'
import reducer, { addItem, removeItem, updateQuantity } from './cartSlice'

const product = { id: 1, name: 'Салют', price: 590, discountPrice: 385 }
const productNoDiscount = { id: 2, name: 'Бенгальская свеча', price: 250, discountPrice: null }

describe('cartSlice', () => {
	it('snapshots unitPrice with discount-over-base precedence on add', () => {
		let state = reducer(undefined, addItem(product))
		expect(state.items[0].unitPrice).toBe(385)
		expect(state.total).toBe(385)
	})

	it('falls back to price when there is no discount', () => {
		let state = reducer(undefined, addItem(productNoDiscount))
		expect(state.items[0].unitPrice).toBe(250)
	})

	it('increments quantity instead of duplicating the line on repeat add', () => {
		let state = reducer(undefined, addItem(product))
		state = reducer(state, addItem(product))
		expect(state.items).toHaveLength(1)
		expect(state.items[0].quantity).toBe(2)
		expect(state.total).toBe(385 * 2)
	})

	it('never lets quantity drop below 1 via updateQuantity', () => {
		let state = reducer(undefined, addItem(product))
		state = reducer(state, updateQuantity({ id: 1, quantity: 0 }))
		expect(state.items[0].quantity).toBe(1)
	})

	it('recomputes total after removeItem', () => {
		let state = reducer(undefined, addItem(product))
		state = reducer(state, addItem(productNoDiscount))
		state = reducer(state, removeItem(1))
		expect(state.items).toHaveLength(1)
		expect(state.total).toBe(250)
	})
})
