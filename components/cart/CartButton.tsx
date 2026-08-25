'use client'

import { useCart } from './CartProvider'

export default function CartButton() {
	const { items, openCart } = useCart()
	const count = items.reduce((sum, i) => sum + i.quantity, 0)

	return (
		<button
			type="button"
			onClick={openCart}
			aria-label={count > 0 ? `Корзина, товаров: ${count}` : 'Корзина'}
			className="font-baron relative flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm text-[#333] shadow-[0_0_10px_0_rgba(0,0,0,0.08)] transition hover:text-firework-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
		>
			корзина
			{count > 0 && (
				<span className="bg-firework-red flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs text-white">
					{count}
				</span>
			)}
		</button>
	)
}
