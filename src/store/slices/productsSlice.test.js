import { describe, expect, it } from 'vitest'
import reducer, { setFilters } from './productsSlice'

const baseState = () => reducer(undefined, { type: '@@INIT' })

describe('productsSlice / setFilters (H11)', () => {
	it('turns inStockOnly and hasCertificate on when explicitly set', () => {
		let state = baseState()
		state = reducer(
			state,
			setFilters({ inStockOnly: true, hasCertificate: true })
		)
		expect(state.filters.inStockOnly).toBe(true)
		expect(state.filters.hasCertificate).toBe(true)
	})

	it('a later partial update (e.g. changing types) does not silently reset booleans set earlier', () => {
		let state = baseState()
		state = reducer(
			state,
			setFilters({ inStockOnly: true, hasCertificate: true })
		)
		// Partial update: only "types" changes, inStockOnly/hasCertificate absent from payload
		state = reducer(state, setFilters({ types: ['салюты'] }))

		expect(state.filters.types).toEqual(['салюты'])
		expect(state.filters.inStockOnly).toBe(true)
		expect(state.filters.hasCertificate).toBe(true)
	})

	it('explicitly clearing a boolean still works', () => {
		let state = baseState()
		state = reducer(state, setFilters({ inStockOnly: true }))
		state = reducer(state, setFilters({ inStockOnly: false }))
		expect(state.filters.inStockOnly).toBe(false)
	})
})
