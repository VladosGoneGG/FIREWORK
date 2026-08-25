'use client'

import { useCart } from './CartProvider'

/**
 * The only interactive piece of an otherwise server-rendered product card
 * or product page — everything else about those stays a Server Component.
 * Doesn't need to fetch anything: the product (name, price, stock) is
 * already known at render time by its Server Component parent. Adding
 * just records {productId, quantity++} client-side; the cart panel is what
 * re-resolves authoritative pricing for whatever ends up in the cart.
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
	const { addItem, openCart } = useCart()

	return (
		<button
			type="button"
			disabled={outOfStock}
			aria-label={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
			onClick={() => {
				addItem(productId)
				openCart()
			}}
			className={`font-baron rounded-xl text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red ${
				outOfStock
					? 'cursor-not-allowed bg-[#e5e2de] text-[#9c9c9c]'
					: 'bg-[#cbb7ff] text-[#333] hover:bg-firework-red hover:text-white'
			} ${className}`}
		>
			{outOfStock ? 'нет в наличии' : 'в корзину'}
		</button>
	)
}
