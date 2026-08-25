// Server-only zod validators for the cart item shape defined in
// schema.ts. Used by lib/cart/actions.ts (validating a Server Action's
// network input) and lib/orders/schema.ts (composed into the checkout
// schema's superRefine). Kept in a separate file from schema.ts
// specifically so client code — lib/cart/storage.ts, reached by every
// page through CartProvider — never imports zod: a file's top-level
// z.object(...) calls are a side effect a bundler can't tree-shake away
// just because one sibling export goes unused, so any client import from
// a file that also defines these would drag all ~280KB of zod along.
// Confirmed by inspecting .next/static/ output before this split existed:
// zod was the single largest client chunk despite nothing client-side
// actually calling it.
//
// If this shape and schema.ts's plain CartItem/CartState ever drift,
// lib/cart/storage.test.ts and lib/orders/actions.test.ts both fail —
// acceptable for a shape this small; not worth deriving one from the
// other just to save a few duplicate lines.

import 'server-only'
import { z } from 'zod'

export const cartItemSchema = z.object({
	productId: z.number().int().positive(),
	quantity: z.number().int().positive(),
})

export const cartStateSchema = z.object({
	version: z.literal(2),
	items: z.array(cartItemSchema),
})
