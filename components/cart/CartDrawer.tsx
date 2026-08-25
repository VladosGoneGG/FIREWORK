'use client'

import Dialog from '@/components/ui/Dialog'
import { formatPrice } from '@/lib/format'
import { MIN_ORDER_AMOUNT } from '@/lib/cart/schema'
import { useCart } from './CartProvider'
import { useResolvedCart } from './useResolvedCart'

const TITLE_ID = 'cart-drawer-title'

export default function CartDrawer() {
	const { isOpen, closeCart, decrement, addItem, removeItem, items } = useCart()
	const { resolved, resolving } = useResolvedCart()

	const enough = resolved.total >= MIN_ORDER_AMOUNT

	return (
		<Dialog open={isOpen} onClose={closeCart} titleId={TITLE_ID}>
			<div className="font-baron flex h-full flex-col">
				<div className="flex items-center justify-between border-b border-[#efebe6] px-4 py-3">
					<h2 id={TITLE_ID} className="text-base font-semibold text-[#333]">
						корзина
					</h2>
					<button
						type="button"
						onClick={closeCart}
						aria-label="Закрыть корзину"
						className="rounded-full p-1.5 text-[#9c9c9c] hover:bg-[#f6f4f2] hover:text-[#333]"
					>
						✕
					</button>
				</div>

				<div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
					{items.length === 0 ? (
						<p className="text-sm text-[#9c9c9c]">пусто</p>
					) : resolving ? (
						<p className="text-sm text-[#9c9c9c]">обновляем цены…</p>
					) : (
						<>
							{resolved.removedProductIds.length > 0 && (
								<div role="alert" className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
									{resolved.removedProductIds.length === 1
										? 'один товар больше недоступен и был убран из корзины'
										: `${resolved.removedProductIds.length} товара(ов) больше недоступны и были убраны из корзины`}
									<button
										type="button"
										onClick={() => resolved.removedProductIds.forEach(removeItem)}
										className="ml-2 underline"
									>
										убрать
									</button>
								</div>
							)}
							{resolved.lines.map(line => (
								<div key={line.productId} className="flex items-center gap-3">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm text-[#333]">{line.name}</p>
										<p className="text-[10px] text-[#9c9c9c]">{line.manufacturer}</p>
										<div className="mt-1 flex items-center gap-2">
											<div className="flex items-center gap-1 rounded-full bg-[#f2f0ed]">
												<button
													type="button"
													onClick={() => decrement(line.productId, line.quantity)}
													aria-label="Уменьшить количество"
													className="h-6 w-6 rounded-full text-sm hover:bg-black/10"
												>
													–
												</button>
												<span className="min-w-4 text-center text-xs">{line.quantity}</span>
												<button
													type="button"
													onClick={() => addItem(line.productId)}
													aria-label="Увеличить количество"
													className="h-6 w-6 rounded-full text-sm hover:bg-black/10"
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
				</div>

				{items.length > 0 && !resolving && (
					<div className="border-t border-[#efebe6] px-4 py-3">
						<div className="text-center text-lg font-semibold text-[#333]">
							{formatPrice(resolved.total)} ₽
						</div>
						<button
							type="button"
							disabled={!enough}
							className={`btn-firework mt-2 w-full ${!enough ? 'bg-none bg-[#efebe7] text-[#bd52e9]' : ''}`}
						>
							{enough
								? 'продолжить'
								: `не хватает ещё ${formatPrice(MIN_ORDER_AMOUNT - resolved.total)} ₽`}
						</button>
					</div>
				)}
			</div>
		</Dialog>
	)
}
