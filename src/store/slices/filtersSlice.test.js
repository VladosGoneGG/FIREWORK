import { describe, expect, it } from 'vitest'
import reducer, { applyNow, resetForm, setField } from './filtersSlice'

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
