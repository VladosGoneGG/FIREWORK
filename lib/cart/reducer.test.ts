import { describe, expect, it } from 'vitest'
import { cartReducer } from './reducer'
import { EMPTY_CART_STATE } from './schema'

describe('cartReducer', () => {
	it('starts from an empty cart', () => {
		expect(EMPTY_CART_STATE.items).toEqual([])
	})

	it('adding a new product creates a line with quantity 1', () => {
		const state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		expect(state.items).toEqual([{ productId: 1, quantity: 1 }])
	})

	it('adding an existing product increments its quantity instead of duplicating the line', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'add', productId: 1 })
		expect(state.items).toEqual([{ productId: 1, quantity: 2 }])
	})

	it('tracks multiple distinct products independently', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'add', productId: 2 })
		state = cartReducer(state, { type: 'add', productId: 1 })
		expect(state.items).toEqual([
			{ productId: 1, quantity: 2 },
			{ productId: 2, quantity: 1 },
		])
	})

	it('setQuantity changes an existing line', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'setQuantity', productId: 1, quantity: 5 })
		expect(state.items).toEqual([{ productId: 1, quantity: 5 }])
	})

	it('setQuantity floors at 1 — it never removes, only "remove" does', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'setQuantity', productId: 1, quantity: 0 })
		expect(state.items).toEqual([{ productId: 1, quantity: 1 }])
		state = cartReducer(state, { type: 'setQuantity', productId: 1, quantity: -5 })
		expect(state.items).toEqual([{ productId: 1, quantity: 1 }])
	})

	it('setQuantity rounds down fractional input', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'setQuantity', productId: 1, quantity: 3.9 })
		expect(state.items).toEqual([{ productId: 1, quantity: 3 }])
	})

	it('remove deletes the line entirely', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'add', productId: 2 })
		state = cartReducer(state, { type: 'remove', productId: 1 })
		expect(state.items).toEqual([{ productId: 2, quantity: 1 }])
	})

	it('removing a product not in the cart is a no-op, not an error', () => {
		const state = cartReducer(EMPTY_CART_STATE, { type: 'remove', productId: 999 })
		expect(state.items).toEqual([])
	})

	it('clear empties the cart', () => {
		let state = cartReducer(EMPTY_CART_STATE, { type: 'add', productId: 1 })
		state = cartReducer(state, { type: 'add', productId: 2 })
		state = cartReducer(state, { type: 'clear' })
		expect(state.items).toEqual([])
	})

	it('hydrate replaces the whole state wholesale', () => {
		const incoming = { version: 2 as const, items: [{ productId: 7, quantity: 3 }] }
		const state = cartReducer(EMPTY_CART_STATE, { type: 'hydrate', state: incoming })
		expect(state).toEqual(incoming)
	})
})
