'use client'

import { useEffect, useState } from 'react'
import { resolveCartAction } from '@/lib/cart/actions'
import type { ResolvedCart } from '@/lib/cart/pricing'
import { useCart } from './CartProvider'

const EMPTY: ResolvedCart = { lines: [], total: 0, removedProductIds: [] }

/**
 * Re-resolves price/stock/total from the server every time the cart's item
 * list changes. `resolving` covers both "hasn't hydrated from storage yet"
 * and "a resolve request is in flight" — callers show one loading state
 * either way rather than needing to know why.
 */
export function useResolvedCart(): { resolved: ResolvedCart; resolving: boolean } {
	const { items, hydrated } = useCart()
	const [resolved, setResolved] = useState<ResolvedCart>(EMPTY)
	const [resolving, setResolving] = useState(true)

	useEffect(() => {
		if (!hydrated) return

		// Data fetching triggered by a dependency change is the effect use
		// case react-hooks' own docs (linked in this rule's message) describe
		// as correct — the server call can't happen during render.
		if (items.length === 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setResolved(EMPTY)
			setResolving(false)
			return
		}

		let cancelled = false
		setResolving(true)
		resolveCartAction(items).then(result => {
			if (!cancelled) {
				setResolved(result)
				setResolving(false)
			}
		})
		return () => {
			cancelled = true
		}
	}, [items, hydrated])

	return { resolved, resolving: resolving || !hydrated }
}
