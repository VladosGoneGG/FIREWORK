// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadCart, saveCart } from './storage'
import { EMPTY_CART_STATE } from './schema'

beforeEach(() => {
	window.localStorage.clear()
})

describe('loadCart', () => {
	it('returns an empty cart when nothing is stored', () => {
		expect(loadCart()).toEqual(EMPTY_CART_STATE)
	})

	it('round-trips a saved cart', () => {
		const state = { version: 2 as const, items: [{ productId: 1, quantity: 2 }] }
		saveCart(state)
		expect(loadCart()).toEqual(state)
	})

	it('recovers to an empty cart from corrupt (non-JSON) storage instead of throwing', () => {
		window.localStorage.setItem('cart:v2', '{not valid json')
		expect(() => loadCart()).not.toThrow()
		expect(loadCart()).toEqual(EMPTY_CART_STATE)
	})

	it('recovers to an empty cart from well-formed JSON that does not match the schema', () => {
		window.localStorage.setItem('cart:v2', JSON.stringify({ items: 'not an array' }))
		expect(loadCart()).toEqual(EMPTY_CART_STATE)
	})

	it('recovers to an empty cart from a malformed payload (negative/fractional quantity)', () => {
		window.localStorage.setItem(
			'cart:v2',
			JSON.stringify({ version: 2, items: [{ productId: 1, quantity: -3 }] })
		)
		expect(loadCart()).toEqual(EMPTY_CART_STATE)
	})

	it('does not trust a stale/future version number', () => {
		window.localStorage.setItem(
			'cart:v2',
			JSON.stringify({ version: 99, items: [{ productId: 1, quantity: 1 }] })
		)
		expect(loadCart()).toEqual(EMPTY_CART_STATE)
	})

	it('migrates from the old app\'s cart:v1 shape, keeping only productId + quantity', () => {
		window.localStorage.setItem(
			'cart:v1',
			JSON.stringify({
				items: [
					{ id: 5, name: 'Салют', price: 900, discountPrice: 700, unitPrice: 700, quantity: 2 },
					{ id: 8, name: 'Петарда', price: 300, unitPrice: 300, quantity: 1 },
				],
				total: 1700, // old client-computed total — must not survive the migration
			})
		)

		const migrated = loadCart()
		expect(migrated).toEqual({
			version: 2,
			items: [
				{ productId: 5, quantity: 2 },
				{ productId: 8, quantity: 1 },
			],
		})
		// price/name/total were on the v1 record but never in the migrated shape
		expect(JSON.stringify(migrated)).not.toContain('price')
		expect(JSON.stringify(migrated)).not.toContain('700')
	})

	it('migration filters out invalid legacy entries instead of crashing', () => {
		window.localStorage.setItem(
			'cart:v1',
			JSON.stringify({ items: [{ id: 'not-a-number', quantity: 1 }, { id: 5, quantity: 0 }, { id: 9, quantity: 2 }] })
		)
		expect(loadCart()).toEqual({ version: 2, items: [{ productId: 9, quantity: 2 }] })
	})

	it('persists the migrated cart under the new key so migration only happens once', () => {
		window.localStorage.setItem('cart:v1', JSON.stringify({ items: [{ id: 5, quantity: 1 }] }))
		loadCart()
		expect(window.localStorage.getItem('cart:v2')).not.toBeNull()
	})

	it('v1 with no items array migrates to empty rather than crashing', () => {
		window.localStorage.setItem('cart:v1', JSON.stringify({ total: 500 }))
		expect(loadCart()).toEqual(EMPTY_CART_STATE)
	})
})
