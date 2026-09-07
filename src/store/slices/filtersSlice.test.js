import { describe, expect, it } from 'vitest'
import reducer, { applyNow, resetForm, setField } from './filtersSlice'

describe('filtersSlice applyNow price/time bound validation', () => {
	it('drops a negative bound instead of keeping it as a real (if useless) restriction', () => {
		// catalog.service.js's parseFiniteNonNegative rejects negative bounds
		// outright (treats them as absent) — cleanForm must agree, or a
		// priceless/durationless product would be excluded from the preview
		// count but still returned by the server (or vice versa).
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(state, setField({ path: 'price.min', value: -50 }))
		state = reducer(state, applyNow())
		expect(state.applied).toEqual({})
	})

	it('drops only the negative side of a range, keeping a valid positive bound', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(state, setField({ path: 'price.min', value: -50 }))
		state = reducer(state, setField({ path: 'price.max', value: 1000 }))
		state = reducer(state, applyNow())
		expect(state.applied).toEqual({ price: { max: 1000 } })
	})

	it('keeps an explicit zero bound (zero is valid, unlike negative)', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(state, setField({ path: 'price.min', value: 0 }))
		state = reducer(state, applyNow())
		expect(state.applied).toEqual({ price: { min: 0 } })
	})
})

describe('filtersSlice resetForm', () => {
	it('clears the applied filter and hides the found section, not just the edit form', () => {
		let state = reducer(undefined, { type: '@@init' })

		state = reducer(state, setField({ path: 'manufacturers', value: ['Joker'] }))
		state = reducer(state, applyNow())
		expect(state.applied).toEqual({ manufacturers: ['Joker'] })
		expect(state.showFound).toBe(true)

		state = reducer(state, resetForm())

		expect(state.applied).toBeNull()
		expect(state.showFound).toBe(false)
		expect(state.form.manufacturers).toEqual([])
	})
})
