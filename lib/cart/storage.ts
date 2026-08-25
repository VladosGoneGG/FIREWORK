// localStorage read/write for the cart. Client-only by construction (every
// call is guarded for `window`), and never throws — corrupt data always
// degrades to an empty cart rather than crashing the app (audit finding
// H6: the old app's loadCart() trusted whatever JSON.parse returned).

import { EMPTY_CART_STATE, isValidCartState, type CartState } from './schema'

const STORAGE_KEY = 'cart:v2'

// The old Vite app's key and shape (src/utils/persistCart.js): a full
// snapshot per item — {id, name, price, discountPrice, unitPrice,
// quantity, ...} — plus a client-computed `total`. We only ever want
// {productId, quantity} out of it; price/name are never trusted from
// storage (see lib/cart/pricing.ts). Read-only: the old app may still be
// running side-by-side during the migration and continues to own this key.
const LEGACY_V1_KEY = 'cart:v1'

function readLegacyV1(): CartState | null {
	try {
		const raw = window.localStorage.getItem(LEGACY_V1_KEY)
		if (!raw) return null
		const legacy = JSON.parse(raw)
		if (!legacy || !Array.isArray(legacy.items)) return null

		const items = legacy.items
			.map((it: unknown) => {
				const record = it as Record<string, unknown>
				return { productId: Number(record?.id), quantity: Number(record?.quantity) }
			})
			.filter(
				(it: { productId: number; quantity: number }) =>
					Number.isInteger(it.productId) &&
					it.productId > 0 &&
					Number.isInteger(it.quantity) &&
					it.quantity > 0
			)

		return { ...EMPTY_CART_STATE, items }
	} catch {
		return null
	}
}

export function loadCart(): CartState {
	if (typeof window === 'undefined') return EMPTY_CART_STATE

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed: unknown = JSON.parse(raw)
			if (isValidCartState(parsed)) return parsed
			// Present but doesn't match the shape (corrupt, hand-edited, or a
			// future version going backward) — fall through rather than trust it.
		}
	} catch {
		// JSON.parse threw, or storage access was denied (privacy mode) —
		// treat exactly like "nothing stored".
	}

	const migrated = readLegacyV1()
	if (migrated) {
		saveCart(migrated)
		return migrated
	}

	return EMPTY_CART_STATE
}

export function saveCart(state: CartState): void {
	if (typeof window === 'undefined') return
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	} catch {
		// Storage full or unavailable — the in-memory cart still works for
		// this session, it just won't survive a reload. Matches the old
		// app's documented behavior for this exact failure mode.
	}
}
