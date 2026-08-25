'use client'

import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { formatPrice } from '@/lib/format'
import { MIN_ORDER_AMOUNT } from '@/lib/cart/schema'
import { useCart } from './CartProvider'
import { useResolvedCart } from './useResolvedCart'

const TITLE_ID = 'cart-drawer-title'

type View = 'cart' | 'checkout' | { confirmed: { orderReference: string } }

export default function CartDrawer() {
	const { isOpen, closeCart, decrement, addItem, removeItem, items, clearCart } = useCart()
	const { resolved, resolving } = useResolvedCart()
	const [view, setView] = useState<View>('cart')

	const enough = resolved.total >= MIN_ORDER_AMOUNT

	const handleClose = () => {
		closeCart()
		// Only reset the view once it's closed, not while animating out —
		// avoids the drawer visibly flashing back to the cart list before
		// it's gone, and never discards a confirmed-order screen the user
		// might reopen to re-read (they can still close it explicitly).
		if (typeof view === 'object') {
			setView('cart')
		}
	}

	return (
		<Dialog open={isOpen} onClose={handleClose} titleId={TITLE_ID}>
			<div className="font-baron flex h-full flex-col">
				<div className="flex items-center justify-between border-b border-[#efebe6] px-4 py-3">
					<h2 id={TITLE_ID} className="text-base font-semibold text-[#333]">
						{typeof view === 'object' ? 'заказ оформлен' : view === 'checkout' ? 'оформление' : 'корзина'}
					</h2>
					<button
						type="button"
						onClick={handleClose}
						aria-label="Закрыть корзину"
						className="flex h-11 w-11 items-center justify-center rounded-full text-[#9c9c9c] hover:bg-[#f6f4f2] hover:text-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
					>
						✕
					</button>
				</div>

				{typeof view === 'object' ? (
					<div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
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
								closeCart()
							}}
							className="btn-firework mt-2"
						>
							продолжить покупки
						</button>
					</div>
				) : (
					<>
						<div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
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
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm text-[#333]">{line.name}</p>
												<p className="text-xs text-[#9c9c9c]">{line.manufacturer}</p>
												<div className="mt-1 flex items-center gap-2">
													<div className="flex items-center gap-1 rounded-full bg-[#f2f0ed]">
														<button
															type="button"
															onClick={() => decrement(line.productId, line.quantity)}
															aria-label="Уменьшить количество"
															className="flex h-9 w-9 items-center justify-center rounded-full text-sm hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
														>
															–
														</button>
														<span className="min-w-4 text-center text-xs">{line.quantity}</span>
														<button
															type="button"
															onClick={() => addItem(line.productId)}
															aria-label="Увеличить количество"
															className="flex h-9 w-9 items-center justify-center rounded-full text-sm hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
														>
															+
														</button>
													</div>
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
										// Cart clears only now — on a server-confirmed order,
										// never before, never on a mere "submitted" state.
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
				)}
			</div>
		</Dialog>
	)
}
