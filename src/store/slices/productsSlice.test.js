import { describe, expect, it } from 'vitest'
import reducer, { fetchQueryPage, loadCatalogQuery, makeQueryKey } from './productsSlice'

// Builds a minimal fake Redux dispatch/getState pair backed by the real
// reducer, so loadCatalogQuery's cache check runs against real state
// without needing a full store.
function makeFakeStore(initialProducts) {
	let state = { ...reducer(undefined, { type: '@@init' }), ...initialProducts }
	const dispatch = action => {
		if (typeof action === 'function') return action(dispatch, getState)
		state = reducer(state, action)
		return action
	}
	const getState = () => ({ products: state })
	return { dispatch, getState, get state() { return state } }
}

const item = (id, overrides = {}) => ({ id, name: id, price: 100, discountPrice: null, ...overrides })

describe('productsSlice fetchQueryPage reducer', () => {
	it('replaces items on page 1 and resets state for a new category/search key', () => {
		let state = reducer(undefined, { type: '@@init' })

		state = reducer(
			state,
			fetchQueryPage.pending('req1', { category: 'Петарды', search: '', page: 1 })
		)
		expect(state.query.status).toBe('loading')
		expect(state.query.key).toBe(makeQueryKey('Петарды', ''))

		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('a'), item('b')], pagination: { page: 1, hasNext: true, totalItems: 5 } },
				'req1',
				{ category: 'Петарды', search: '', page: 1 }
			)
		)
		expect(state.query.status).toBe('succeeded')
		expect(state.query.items.map(i => i.id)).toEqual(['a', 'b'])
		expect(state.query.hasNext).toBe(true)
	})

	it('appends and de-duplicates items when loading page 2 of the same key', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(state, fetchQueryPage.pending('req1', { category: 'Ракеты', search: '', page: 1 }))
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('a'), item('b')], pagination: { page: 1, hasNext: true, totalItems: 4 } },
				'req1',
				{ category: 'Ракеты', search: '', page: 1 }
			)
		)
		state = reducer(state, fetchQueryPage.pending('req2', { category: 'Ракеты', search: '', page: 2 }))
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				// 'b' repeated on the next page must not create a duplicate.
				{ items: [item('b'), item('c')], pagination: { page: 2, hasNext: false, totalItems: 4 } },
				'req2',
				{ category: 'Ракеты', search: '', page: 2 }
			)
		)
		expect(state.query.items.map(i => i.id)).toEqual(['a', 'b', 'c'])
		expect(state.query.hasNext).toBe(false)
	})

	it('ignores a stale fulfilled response after a newer query has already started (rose/tulip race)', () => {
		let state = reducer(undefined, { type: '@@init' })

		// User searches "rose" ...
		state = reducer(state, fetchQueryPage.pending('req-rose', { category: null, search: 'rose', page: 1 }))
		// ...then immediately searches "tulip" before "rose" resolves.
		state = reducer(state, fetchQueryPage.pending('req-tulip', { category: null, search: 'tulip', page: 1 }))
		expect(state.query.key).toBe(makeQueryKey(null, 'tulip'))

		// The stale "rose" request finally resolves — must be ignored.
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('rose-1')], pagination: { page: 1, hasNext: false, totalItems: 1 } },
				'req-rose',
				{ category: null, search: 'rose', page: 1 }
			)
		)
		expect(state.query.key).toBe(makeQueryKey(null, 'tulip'))
		expect(state.query.items).toEqual([])
		expect(state.query.status).toBe('loading')

		// The real "tulip" response arrives after and must be applied.
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('tulip-1')], pagination: { page: 1, hasNext: false, totalItems: 1 } },
				'req-tulip',
				{ category: null, search: 'tulip', page: 1 }
			)
		)
		expect(state.query.items.map(i => i.id)).toEqual(['tulip-1'])
	})

	it('ignores an aborted rejection silently, without setting an error state', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(state, fetchQueryPage.pending('req1', { category: 'Петарды', search: '', page: 1 }))

		const aborted = fetchQueryPage.rejected(
			new Error('canceled'),
			'req1',
			{ category: 'Петарды', search: '', page: 1 }
		)
		aborted.meta.aborted = true
		state = reducer(state, aborted)

		expect(state.query.status).toBe('loading')
		expect(state.query.error).toBeNull()
	})

	it('sets a failed status for a genuine (non-aborted) error on the current key', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(state, fetchQueryPage.pending('req1', { category: 'Петарды', search: '', page: 1 }))
		state = reducer(
			state,
			fetchQueryPage.rejected(new Error('boom'), 'req1', { category: 'Петарды', search: '', page: 1 }, 'Ошибка загрузки товаров')
		)
		expect(state.query.status).toBe('failed')
		expect(state.query.error).toBe('Ошибка загрузки товаров')
	})
})

describe('loadCatalogQuery', () => {
	it('dispatches a real fetch for a first-time key', () => {
		const store = makeFakeStore({})
		const result = store.dispatch(loadCatalogQuery({ category: 'Петарды', search: '' }))
		// A createAsyncThunk dispatch returns a promise with an .abort() method.
		expect(typeof result?.abort).toBe('function')
		expect(store.state.query.status).toBe('loading')
	})

	it('hydrates instantly from cache instead of dispatching a new fetch for a recently-seen key', () => {
		const store = makeFakeStore({})
		store.dispatch(fetchQueryPage.pending('req1', { category: 'Петарды', search: '', page: 1 }))
		store.dispatch(
			fetchQueryPage.fulfilled(
				{ items: [item('a')], pagination: { page: 1, hasNext: false, totalItems: 1 } },
				'req1',
				{ category: 'Петарды', search: '', page: 1 }
			)
		)
		expect(Object.keys(store.state.queryCache)).toContain(makeQueryKey('Петарды', ''))

		const result = store.dispatch(loadCatalogQuery({ category: 'Петарды', search: '' }))
		expect(result).toBeNull() // no network dispatch — served from cache
		expect(store.state.query.status).toBe('succeeded')
		expect(store.state.query.items.map(i => i.id)).toEqual(['a'])
	})
})
