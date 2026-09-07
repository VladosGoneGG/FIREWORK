import { describe, expect, it } from 'vitest'
import { getCatalogLoadingState } from './catalogLoadingState'

const sectionWith = n => [{ title: 'x', items: Array.from({ length: n }, (_, i) => ({ id: i })) }]

describe('getCatalogLoadingState', () => {
	it('shows the full-grid skeleton on the very first load (no sections yet)', () => {
		expect(getCatalogLoadingState('loading', [])).toEqual({
			showInitialSkeleton: true,
			showLoadingMore: false,
		})
	})

	it('shows the full-grid skeleton while sections exist but are all still empty', () => {
		expect(getCatalogLoadingState('loading', sectionWith(0))).toEqual({
			showInitialSkeleton: true,
			showLoadingMore: false,
		})
	})

	it('never re-shows the full-grid skeleton once at least one product is already rendered, even mid-fetch', () => {
		expect(getCatalogLoadingState('loading', sectionWith(3))).toEqual({
			showInitialSkeleton: false,
			showLoadingMore: true,
		})
	})

	it('shows neither indicator once loading has finished', () => {
		expect(getCatalogLoadingState('succeeded', sectionWith(3))).toEqual({
			showInitialSkeleton: false,
			showLoadingMore: false,
		})
		expect(getCatalogLoadingState('succeeded', [])).toEqual({
			showInitialSkeleton: false,
			showLoadingMore: false,
		})
	})

	it('treats a failed status like "not loading" (the caller renders an error state instead)', () => {
		expect(getCatalogLoadingState('failed', [])).toEqual({
			showInitialSkeleton: false,
			showLoadingMore: false,
		})
	})
})
