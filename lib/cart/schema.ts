// Plain TypeScript only — no zod, no runtime dependency at all. This file
// is reached by every page (via CartProvider in the root layout, which
// every route renders), so anything it imports ships to every visitor.
// The zod-based validator for this same shape lives in schema.server.ts,
// for server-side use only (Server Actions never ship their real
// implementation to the client, so that cost is paid nowhere here) — see
// that file's docblock for why the split exists and how the two shapes
// are kept in sync.

export interface CartItem {
	productId: number
	quantity: number
}

export const CART_STORAGE_VERSION = 2 as const

export interface CartState {
	version: typeof CART_STORAGE_VERSION
	items: CartItem[]
}

export const EMPTY_CART_STATE: CartState = { version: CART_STORAGE_VERSION, items: [] }

// ₽4,800 minimum order — see the audit's business-rules table. Enforced
// against the server-resolved total (lib/cart/pricing.ts), never a
// client-computed one.
export const MIN_ORDER_AMOUNT = 4800

function isValidCartItem(value: unknown): value is CartItem {
	if (typeof value !== 'object' || value === null) return false
	const item = value as Record<string, unknown>
	return (
		typeof item.productId === 'number' &&
		Number.isInteger(item.productId) &&
		item.productId > 0 &&
		typeof item.quantity === 'number' &&
		Number.isInteger(item.quantity) &&
		item.quantity > 0
	)
}

/**
 * Client-side validation of whatever JSON happens to be sitting in
 * localStorage — see lib/cart/storage.ts. The persisted shape is trivial
 * enough that a few manual checks give the same guarantee (corrupt data
 * recovers to an empty cart, never crashes) as a full schema library,
 * without paying for one on every page load.
 */
export function isValidCartState(value: unknown): value is CartState {
	if (typeof value !== 'object' || value === null) return false
	const state = value as Record<string, unknown>
	return (
		state.version === CART_STORAGE_VERSION &&
		Array.isArray(state.items) &&
		state.items.every(isValidCartItem)
	)
}
