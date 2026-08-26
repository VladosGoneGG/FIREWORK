'use client'

import { useCart } from './CartProvider'

/**
 * The only interactive piece of an otherwise server-rendered product card
 * — everything else about the card stays a Server Component. Doesn't need
 * to fetch anything: the product (name, price, stock) is already known at
 * render time by its Server Component parent. Adding just records
 * {productId, quantity++} client-side; the cart panel re-resolves
 * authoritative pricing for whatever ends up in it.
 *
 * Compact icon-only button (40x25, "+" glyph) — matches the original
 * catalogue-tile button exactly, not a full-text "в корзину" label.
 */
export default function AddToCartButton({
	productId,
	outOfStock,
	className = '',
}: {
	productId: number
	outOfStock?: boolean
	className?: string
}) {
	const { addItem } = useCart()

	return (
		<button
			type="button"
			disabled={outOfStock}
			aria-label={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
			title={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
			onClick={() => addItem(productId)}
			className={`group inline-flex h-[25px] w-[40px] items-center justify-center rounded-[10px] align-middle transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd52e9] ${
				outOfStock
					? 'cursor-not-allowed bg-[#e5e2de] text-[#9c9c9c]'
					: 'cursor-pointer bg-[#cbb7ff] text-black hover:bg-purple-500 hover:text-white active:scale-95 active:bg-stone-200 active:text-stone-600'
			} ${className}`}
		>
			<svg className="block h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
				<path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			</svg>
		</button>
	)
}
