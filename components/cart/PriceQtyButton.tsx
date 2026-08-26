'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useCart } from './CartProvider'

const fmtNum = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n))

/**
 * The original product-page primary CTA: a combined qty-stepper +
 * running-total pill, not a plain "add to cart" button. Directional
 * gradient hover/tap feedback via motion — ported from PriceQtyButton.jsx.
 * Cart items only ever persist {productId, quantity} (no price snapshots,
 * see lib/cart/schema.ts) — unitPrice here is the page's already-known
 * server-resolved display price, purely for the running total shown on
 * the button; checkout re-resolves authoritative pricing regardless.
 */
export default function PriceQtyButton({
	productId,
	unitPrice,
	outOfStock,
	className = '',
}: {
	productId: number
	unitPrice: number
	outOfStock?: boolean
	className?: string
}) {
	const { items, addItem, decrement } = useCart()
	const inCartQty = items.find(i => i.productId === productId)?.quantity ?? 0

	const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null)
	const [tapSide, setTapSide] = useState<'left' | 'right' | null>(null)
	const lockRef = useRef(false)

	const withLock = (fn: () => void) => {
		if (lockRef.current) return
		lockRef.current = true
		try {
			fn()
		} finally {
			setTimeout(() => {
				lockRef.current = false
			}, 120)
		}
	}

	const onPlus = () => withLock(() => addItem(productId))
	const onMinus = () => withLock(() => decrement(productId, inCartQty))

	if (outOfStock) {
		return (
			<div
				className={`flex h-11 w-full items-center justify-center rounded-[10px] bg-[#e5e2de] text-sm text-[#9c9c9c] ${className}`}
			>
				нет в наличии
			</div>
		)
	}

	let bgClass = 'bg-purple-500'
	if (hoverSide === 'left') bgClass = 'bg-gradient-to-r from-violet-300 to-purple-500'
	else if (hoverSide === 'right') bgClass = 'bg-gradient-to-r from-purple-500 to-violet-300'
	if (tapSide === 'left') bgClass = 'bg-gradient-to-r from-stone-200 to-purple-500'
	else if (tapSide === 'right') bgClass = 'bg-gradient-to-r from-purple-500 to-stone-200'

	const qty = Math.max(1, inCartQty || 1)
	const total = unitPrice * qty

	return (
		<div
			className={`relative inline-flex h-11 w-full items-center rounded-[10px] px-[10px] font-normal select-none ${className}`}
			onMouseLeave={() => {
				setHoverSide(null)
				setTapSide(null)
			}}
		>
			<motion.div
				aria-hidden
				className={`absolute inset-0 rounded-[10px] ${bgClass}`}
				style={{ willChange: 'transform' }}
				animate={{ scale: tapSide ? 0.99 : 1 }}
				transition={{ duration: 0.12, ease: 'easeOut' }}
			/>

			<div className="relative z-10 flex w-full items-center justify-between">
				<motion.button
					type="button"
					whileHover={{ scale: 1.12 }}
					whileTap={{ scale: 0.92 }}
					onHoverStart={() => setHoverSide('left')}
					onHoverEnd={() => setHoverSide(null)}
					onTapStart={() => setTapSide('left')}
					onTapCancel={() => setTapSide(null)}
					onTap={() => {
						setTapSide(null)
						onMinus()
					}}
					aria-label="Уменьшить количество"
					title="Уменьшить количество"
					className="relative grid h-5 w-5 cursor-pointer place-items-center rounded-[6px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
				>
					<div className={`h-[1.67px] w-3 transition-colors duration-150 ${tapSide === 'left' ? 'bg-stone-600' : 'bg-white'}`} />
				</motion.button>

				<div className="font-baron flex cursor-default flex-col items-center leading-none select-none">
					<div className="flex items-baseline gap-1 pb-[5px]">
						<span className="text-[20px] leading-none font-normal text-white">{fmtNum(total)}</span>
						<span className="relative top-[2px] text-[12px] leading-none font-normal text-white lowercase">
							руб.
						</span>
					</div>
				</div>

				<motion.button
					type="button"
					whileHover={{ scale: 1.12 }}
					whileTap={{ scale: 0.92 }}
					onHoverStart={() => setHoverSide('right')}
					onHoverEnd={() => setHoverSide(null)}
					onTapStart={() => setTapSide('right')}
					onTapCancel={() => setTapSide(null)}
					onTap={() => {
						setTapSide(null)
						onPlus()
					}}
					aria-label="Увеличить количество"
					title="Увеличить количество"
					className="relative grid h-5 w-5 cursor-pointer place-items-center rounded-[6px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
				>
					<div className={`absolute h-[1.67px] w-3 transition-colors duration-150 ${tapSide === 'right' ? 'bg-stone-600' : 'bg-white'}`} />
					<div className={`absolute h-3 w-[1.67px] transition-colors duration-150 ${tapSide === 'right' ? 'bg-stone-600' : 'bg-white'}`} />
				</motion.button>
			</div>
		</div>
	)
}
