'use server'

import { cartItemSchema } from './schema.server'
import { resolveCart, type ResolvedCart } from './pricing'
import { z } from 'zod'

const itemsSchema = z.array(cartItemSchema).max(200)

/**
 * Called by the client cart (a Client Component, via a plain async call —
 * no form involved) whenever its item list changes, to get current prices,
 * stock and validity. The client never computes or trusts a price itself;
 * this is the only path from {productId, quantity} to a real total.
 */
export async function resolveCartAction(items: unknown): Promise<ResolvedCart> {
	const parsed = itemsSchema.safeParse(items)
	if (!parsed.success) return { lines: [], total: 0, removedProductIds: [] }
	return resolveCart(parsed.data)
}
