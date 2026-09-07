import { describe, expect, it } from 'vitest'
import reducer, {
	fetchCatalogFacets,
	fetchQueryPage,
	hasActiveFilters,
	loadCatalogQuery,
	makeQueryKey,
	selectCatalogFacets,
} from './productsSlice'

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

describe('makeQueryKey / hasActiveFilters with advanced filters', () => {
	it('gives the same key regardless of checkbox click order (stable serialization)', () => {
		const a = makeQueryKey('all', '', { manufacturers: ['Joker', 'Klarrog'] })
		const b = makeQueryKey('all', '', { manufacturers: ['Klarrog', 'Joker'] })
		expect(a).toBe(b)
	})

	it('produces a different key once a filter is applied, and the same key once cleared again', () => {
		const empty = makeQueryKey('all', '', null)
		const withFilter = makeQueryKey('all', '', { manufacturers: ['Joker'] })
		const clearedAgain = makeQueryKey('all', '', {})

		expect(withFilter).not.toBe(empty)
		expect(clearedAgain).toBe(empty)
	})

	it('treats an empty/undefined filters object as "no filters active"', () => {
		expect(hasActiveFilters(undefined)).toBe(false)
		expect(hasActiveFilters({})).toBe(false)
		expect(hasActiveFilters({ types: [], manufacturers: [] })).toBe(false)
		expect(hasActiveFilters({ price: { min: null, max: null } })).toBe(false)
	})

	it('recognizes a real facet as active', () => {
		expect(hasActiveFilters({ manufacturers: ['Joker'] })).toBe(true)
		expect(hasActiveFilters({ price: { min: 100 } })).toBe(true)
		expect(hasActiveFilters({ shots: [50] })).toBe(true)
	})
})

describe('productsSlice fetchQueryPage reducer with advanced filters', () => {
	it('carries the same filters across pages (loadMore must not drop them)', () => {
		let state = reducer(undefined, { type: '@@init' })
		const filters = { manufacturers: ['Joker'] }

		state = reducer(
			state,
			fetchQueryPage.pending('req1', { category: 'all', search: '', filters, page: 1 })
		)
		expect(state.query.key).toBe(makeQueryKey('all', '', filters))

		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('a')], pagination: { page: 1, hasNext: true, totalItems: 2 } },
				'req1',
				{ category: 'all', search: '', filters, page: 1 }
			)
		)
		expect(state.query.filters).toEqual(filters)

		// loadMore-style page 2 request for the SAME filters must resolve to the same key/keep items.
		state = reducer(
			state,
			fetchQueryPage.pending('req2', { category: 'all', search: '', filters, page: 2 })
		)
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('b')], pagination: { page: 2, hasNext: false, totalItems: 2 } },
				'req2',
				{ category: 'all', search: '', filters, page: 2 }
			)
		)
		expect(state.query.items.map(i => i.id)).toEqual(['a', 'b'])
	})

	it('starts a fresh query (resets items) when only the filters change, category/search unchanged', () => {
		let state = reducer(undefined, { type: '@@init' })

		state = reducer(
			state,
			fetchQueryPage.pending('req1', { category: 'all', search: '', filters: null, page: 1 })
		)
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('unfiltered-a')], pagination: { page: 1, hasNext: false, totalItems: 1 } },
				'req1',
				{ category: 'all', search: '', filters: null, page: 1 }
			)
		)
		expect(state.query.items.map(i => i.id)).toEqual(['unfiltered-a'])

		// Applying a filter (clearing pagination back to page 1) must not keep the old unfiltered items.
		state = reducer(
			state,
			fetchQueryPage.pending('req2', {
				category: 'all',
				search: '',
				filters: { manufacturers: ['Joker'] },
				page: 1,
			})
		)
		expect(state.query.items).toEqual([])
		expect(state.query.status).toBe('loading')
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

	it('clearing filters (applied -> null) dispatches a fresh unfiltered fetch and resets pagination', () => {
		const store = makeFakeStore({})
		store.dispatch(
			fetchQueryPage.pending('req1', {
				category: 'all',
				search: '',
				filters: { manufacturers: ['Joker'] },
				page: 1,
			})
		)
		store.dispatch(
			fetchQueryPage.fulfilled(
				{ items: [item('a'), item('b')], pagination: { page: 1, hasNext: false, totalItems: 2 } },
				'req1',
				{ category: 'all', search: '', filters: { manufacturers: ['Joker'] }, page: 1 }
			)
		)
		expect(store.state.query.items).toHaveLength(2)

		// Filters cleared: same category/search, filters now null/empty.
		const result = store.dispatch(loadCatalogQuery({ category: 'all', search: '', filters: null }))
		expect(typeof result?.abort).toBe('function') // a real new fetch, not served from the filtered cache entry
		expect(store.state.query.page).toBe(0) // back to INITIAL_QUERY until the fresh fetch resolves
		expect(store.state.query.items).toEqual([])
	})
})

describe('productsSlice fetchCatalogFacets reducer', () => {
	it('starts idle and populates types/manufacturers/power on success', () => {
		let state = reducer(undefined, { type: '@@init' })
		expect(selectCatalogFacets({ products: state }).status).toBe('idle')

		state = reducer(state, fetchCatalogFacets.pending('req1'))
		expect(selectCatalogFacets({ products: state }).status).toBe('loading')

		state = reducer(
			state,
			fetchCatalogFacets.fulfilled(
				{ types: ['петарды'], manufacturers: ['джокер'], power: ['слабый', 'мощный'] },
				'req1'
			)
		)
		const facets = selectCatalogFacets({ products: state })
		expect(facets.status).toBe('succeeded')
		expect(facets.types).toEqual(['петарды'])
		expect(facets.manufacturers).toEqual(['джокер'])
		expect(facets.power).toEqual(['слабый', 'мощный'])
	})

	it('a failed facets fetch does not touch items/query/pagination state', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('a')], pagination: { page: 1, hasNext: false, totalItems: 1 } },
				'req1',
				{ category: 'all', search: '', page: 1 }
			)
		)

		state = reducer(state, fetchCatalogFacets.pending('req1'))
		state = reducer(state, fetchCatalogFacets.rejected(new Error('network down'), 'req1', undefined, 'Ошибка загрузки фильтров'))

		const facets = selectCatalogFacets({ products: state })
		expect(facets.status).toBe('failed')
		expect(facets.error).toBe('Ошибка загрузки фильтров')
		// Unrelated state must be completely unaffected — a facets failure
		// must never block normal catalog browsing.
		expect(state.items).toEqual([])
		expect(state.query.items).toEqual([])
	})

	it('facets are independent of state.products.items — loading more product pages must not change them', () => {
		let state = reducer(undefined, { type: '@@init' })
		state = reducer(
			state,
			fetchCatalogFacets.fulfilled(
				{ types: ['петарды'], manufacturers: ['джокер'], power: [] },
				'req1'
			)
		)
		const before = selectCatalogFacets({ products: state })

		// Simulate loading page 1 then page 2 of the home catalog.
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('a')], pagination: { page: 1, hasNext: true, totalItems: 2 } },
				'req1',
				{ category: 'all', search: '', page: 1 }
			)
		)
		state = reducer(
			state,
			fetchQueryPage.fulfilled(
				{ items: [item('b')], pagination: { page: 2, hasNext: false, totalItems: 2 } },
				'req2',
				{ category: 'all', search: '', page: 2 }
			)
		)

		expect(selectCatalogFacets({ products: state })).toEqual(before)
	})
})
