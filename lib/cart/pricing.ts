// The one place cart items become priced line items. Server-only: the
// client sends {productId, quantity}, this resolves current price, stock
// and existence against the catalogue boundary (lib/catalogue.ts) — never
// the other way around. Both the live cart display (lib/cart/actions.ts)
// and, in P6, order submission call this same function, so "authoritative
// price" can never quietly diverge between browsing and checkout.
//
// This is also the exact seam the future 1C integration replaces nothing
// about: getProductById already hides the fixture behind lib/catalogue.ts,
// so swapping that one file for a real 1C-backed implementation makes
// every price this function returns live, with no change here.

import 'server-only'
import { getCurrentPrice, getProductById, hasValidDiscount } from '@/lib/catalogue'
import type { CartItem } from './schema'

export interface ResolvedCartLine {
	productId: number
	slug: string
	name: string
	manufacturer: string
	quantity: number
	unitPrice: number
	originalPrice: number
	discounted: boolean
	lineTotal: number
	stock: number
	inStock: boolean
}

export interface ResolvedCart {
	lines: ResolvedCartLine[]
	total: number
	/** productIds that were requested but no longer resolve in the catalogue. */
	removedProductIds: number[]
}

export async function resolveCart(items: CartItem[]): Promise<ResolvedCart> {
	const lines: ResolvedCartLine[] = []
	const removedProductIds: number[] = []

	for (const item of items) {
		const product = await getProductById(item.productId)
		if (!product) {
			removedProductIds.push(item.productId)
			continue
		}

		const unitPrice = getCurrentPrice(product)
		lines.push({
			productId: product.id,
			slug: product.slug,
			name: product.name,
			manufacturer: product.manufacturer,
			quantity: item.quantity,
			unitPrice,
			originalPrice: product.price,
			discounted: hasValidDiscount(product),
			lineTotal: unitPrice * item.quantity,
			stock: product.stock,
			inStock: product.stock > 0,
		})
	}

	const total = lines.reduce((sum, line) => sum + line.lineTotal, 0)
	return { lines, total, removedProductIds }
}
