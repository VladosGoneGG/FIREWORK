'use client'

import Image from 'next/image'
import { useState } from 'react'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { formatPrice } from '@/lib/format'
import { MIN_ORDER_AMOUNT } from '@/lib/cart/schema'
import Qty from './Qty'
import { useCart } from './CartProvider'
import { useResolvedCart } from './useResolvedCart'

type View = 'cart' | 'checkout' | { confirmed: { orderReference: string } }

/**
 * The item-list/checkout/confirmation content shared by both cart
 * surfaces — the desktop docked CartAside (always visible, no open/close)
 * and the mobile modal CartSheet. Only the outer chrome (dialog vs plain
 * column) differs between them; this is the part that was one component
 * (CartDrawer) before the parity restoration split it structurally to
 * match the original's docked-desktop / bottom-sheet-mobile layouts.
 */
export default function CartBody({ onRequestClose }: { onRequestClose?: () => void }) {
	const { decrement, addItem, removeItem, items, clearCart } = useCart()
	const { resolved, resolving } = useResolvedCart()
	const [view, setView] = useState<View>('cart')

	const enough = resolved.total >= MIN_ORDER_AMOUNT

	if (typeof view === 'object') {
		return (
			<div role="status" className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8 text-center">
				<Image src="/SVG/sucess.svg" alt="" width={64} height={64} aria-hidden />
				<p className="text-sm text-[#333]">
					заказ <span className="font-semibold">№ {view.confirmed.orderReference}</span> принят
				</p>
				<p className="max-w-[220px] text-xs text-[#625a51]">
					как только его соберут, вам придёт SMS-оповещение
				</p>
				<button
					type="button"
					onClick={() => {
						setView('cart')
						onRequestClose?.()
					}}
					className="btn-firework mt-2"
				>
					продолжить покупки
				</button>
			</div>
		)
	}

	return (
		<>
			<div className="scroll-hidden flex-1 space-y-3 overflow-y-auto px-4 py-3">
				{items.length === 0 ? (
					<p className="text-sm text-[#9c9c9c]">пусто</p>
				) : resolving ? (
					<p className="text-sm text-[#9c9c9c]">обновляем цены…</p>
				) : (
					<>
						{resolved.removedProductIds.length > 0 && (
							<div role="alert" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
								{resolved.removedProductIds.length === 1
									? 'один товар больше недоступен и был убран из корзины'
									: `${resolved.removedProductIds.length} товара(ов) больше недоступны и были убраны из корзины`}
								<button
									type="button"
									onClick={() => resolved.removedProductIds.forEach(removeItem)}
									className="ml-2 inline-block min-h-11 py-2 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
								>
									убрать
								</button>
							</div>
						)}
						{resolved.lines.map(line => (
							<div key={line.productId} className="flex items-center gap-3">
								<div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[10px] bg-[#f6f4f2]">
									<Image src="/SVG/full-block.svg" alt="" width={70} height={70} className="h-full w-full object-cover" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm text-[#333]">{line.name}</p>
									<p className="text-xs text-[#9c9c9c]">{line.manufacturer}</p>
									<div className="mt-1 flex items-center gap-2">
										<Qty
											value={line.quantity}
											onDec={() => decrement(line.productId, line.quantity)}
											onInc={() => addItem(line.productId)}
										/>
										<span className="text-xs font-semibold text-[#333]">
											{formatPrice(line.lineTotal)} ₽
										</span>
									</div>
								</div>
							</div>
						))}
					</>
				)}

				{view === 'checkout' && items.length > 0 && !resolving && (
					<CheckoutForm
						items={items}
						onConfirmed={({ orderReference }) => {
							clearCart()
							setView({ confirmed: { orderReference } })
						}}
					/>
				)}
			</div>

			{items.length > 0 && !resolving && view === 'cart' && (
				<div className="border-t border-[#efebe6] px-4 py-3">
					<div className="text-center text-lg font-semibold text-[#333]">
						{formatPrice(resolved.total)} ₽
					</div>
					<button
						type="button"
						disabled={!enough}
						onClick={() => setView('checkout')}
						className={`btn-firework mt-2 w-full ${!enough ? 'bg-none bg-[#efebe7] text-[#bd52e9]' : ''}`}
					>
						{enough
							? 'продолжить'
							: `не хватает ещё ${formatPrice(MIN_ORDER_AMOUNT - resolved.total)} ₽`}
					</button>
				</div>
			)}
		</>
	)
}
