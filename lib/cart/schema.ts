// Shared by client (CartProvider, storage) and server (the Server Actions
// in lib/cart/actions.ts and, in P6, checkout) — one schema, not two
// hand-synced copies. This is the ONLY thing about the cart that persists:
// stable product identity + quantity. No price, no name, no snapshot — see
// lib/cart/pricing.ts for why that matters.

import { z } from 'zod'

export const cartItemSchema = z.object({
	productId: z.number().int().positive(),
	quantity: z.number().int().positive(),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const CART_STORAGE_VERSION = 2 as const

export const cartStateSchema = z.object({
	version: z.literal(CART_STORAGE_VERSION),
	items: z.array(cartItemSchema),
})
export type CartState = z.infer<typeof cartStateSchema>

export const EMPTY_CART_STATE: CartState = { version: CART_STORAGE_VERSION, items: [] }

// ₽4,800 minimum order — see the audit's business-rules table. Enforced
// against the server-resolved total (lib/cart/pricing.ts), never a
// client-computed one.
export const MIN_ORDER_AMOUNT = 4800
