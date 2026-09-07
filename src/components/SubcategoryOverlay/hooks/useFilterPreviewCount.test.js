import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as productsApi from '../../../api/productsApi'
import useFilterPreviewCount from './useFilterPreviewCount'

describe('useFilterPreviewCount', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('does not fetch while inactive (panel not open) — no request on every mount', async () => {
		const spy = vi.spyOn(productsApi, 'getCatalogPage')
		renderHook(() =>
			useFilterPreviewCount({ category: 'all', search: '', filters: {}, active: false })
		)
		await new Promise(resolve => setTimeout(resolve, 400))
		expect(spy).not.toHaveBeenCalled()
	})

	it('fetches the exact total (limit=1, no category) once active, replacing the old client-side approximation', async () => {
		const spy = vi
			.spyOn(productsApi, 'getCatalogPage')
			.mockResolvedValue({ pagination: { totalItems: 580 } })

		const { result } = renderHook(() =>
			useFilterPreviewCount({ category: 'all', search: '', filters: {}, active: true })
		)
		expect(result.current.count).toBeNull()

		await waitFor(() => expect(result.current.count).toBe(580))

		expect(spy).toHaveBeenCalledWith(
			expect.objectContaining({ page: 1, limit: 1, category: null, search: '', filters: {} })
		)
	})

	it('scopes the count to the currently selected category, matching what "показать" would actually return', async () => {
		const spy = vi
			.spyOn(productsApi, 'getCatalogPage')
			.mockResolvedValue({ pagination: { totalItems: 42 } })

		renderHook(() =>
			useFilterPreviewCount({
				category: 'Петарды',
				search: '',
				filters: { manufacturers: ['джокер'] },
				active: true,
			})
		)

		await waitFor(() => expect(spy).toHaveBeenCalled())
		expect(spy).toHaveBeenCalledWith(
			expect.objectContaining({ category: 'Петарды', filters: { manufacturers: ['джокер'] } })
		)
	})

	it('debounces rapid filter changes into a single trailing request for the final value', async () => {
		const spy = vi
			.spyOn(productsApi, 'getCatalogPage')
			.mockResolvedValue({ pagination: { totalItems: 10 } })

		const { rerender } = renderHook(
			({ filters }) =>
				useFilterPreviewCount({ category: 'all', search: '', filters, active: true }),
			{ initialProps: { filters: { manufacturers: ['a'] } } }
		)
		// Leading value fires immediately (no artificial delay for the very
		// first count when the panel opens — same convention as category
		// changes in useCatalogFilterQuery).
		await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

		rerender({ filters: { manufacturers: ['a', 'b'] } })
		rerender({ filters: { manufacturers: ['a', 'b', 'c'] } })

		// The two rapid intermediate changes must collapse into exactly ONE
		// trailing request for the LAST value — not one request per change,
		// and not stuck on an intermediate value.
		await waitFor(() => expect(spy).toHaveBeenCalledTimes(2))
		expect(spy).toHaveBeenLastCalledWith(
			expect.objectContaining({ filters: { manufacturers: ['a', 'b', 'c'] } })
		)
	})

	it('a failed request does not throw and leaves status as failed without crashing', async () => {
		vi.spyOn(productsApi, 'getCatalogPage').mockRejectedValue(new Error('network down'))

		const { result } = renderHook(() =>
			useFilterPreviewCount({ category: 'all', search: '', filters: {}, active: true })
		)

		await waitFor(() => expect(result.current.status).toBe('failed'))
		expect(result.current.count).toBeNull()
	})
})
