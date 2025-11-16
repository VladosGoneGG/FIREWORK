// src/components/ProductSection/ProductSection.jsx
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import ProductCardMiniSkeleton from '../ProductCardMini/parts/ProductCardMiniSkeleton'

/**
 * Props:
 * - title: string
 * - products: array
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory: ({ title, products }) => void
 * - loading: boolean
 * - showHeader?: boolean
 */

const CARD_W = 120 // ширина карточки по макету
const GAP = 10 // gap-[11px]
const MAX_COLS = 5 // максимум карточек в ряд

const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
	showHeader = true,
}) => {
	const wrapRef = useRef(null)
	const [cols, setCols] = useState(5)

	// пересчёт количества колонок от ширины контейнера
	useEffect(() => {
		const el = wrapRef.current
		if (!el) return

		const computeCols = containerW => {
			if (!containerW) return 1

			// без лишнего урезания ширины — считаем прямо по контейнеру
			let n = Math.floor((containerW + GAP) / (CARD_W + GAP))

			if (n < 1) n = 1
			if (n > MAX_COLS) n = MAX_COLS

			// не показываем больше, чем есть товаров
			return Math.min(n, products.length || 1)
		}

		const measure = () => {
			const w = el.clientWidth || 0
			setCols(prev => {
				const next = computeCols(w)
				return next === prev ? prev : next
			})
		}

		measure()

		let ro
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(measure)
			ro.observe(el)
		}
		window.addEventListener('resize', measure)
		window.addEventListener('orientationchange', measure)

		return () => {
			ro?.disconnect?.()
			window.removeEventListener('resize', measure)
			window.removeEventListener('orientationchange', measure)
		}
	}, [products.length])

	const visible = useMemo(() => products.slice(0, cols || 1), [products, cols])

	const handleOpenMore = () => {
		if (onOpenSubcategory) {
			onOpenSubcategory({ title, products })
		}
	}

	const EASE = 'easeOut'
	const DURATION = 0.15
	const GRID_BLOCK = {
		hidden: { opacity: 0, y: 14 },
		show: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION } },
	}

	const hasMore = !loading && products.length > visible.length

	return (
		<section className='space-y-3'>
			{showHeader && (
				<div className='flex items-center justify-between'>
					<h3 className='text-[18px] mt-[1px] lowercase font-baron pl-2.5'>
						{title}
					</h3>

					{hasMore && (
						<button
							type='button'
							onClick={handleOpenMore}
							className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer pr-[10px]'
						>
							посмотреть ещё
						</button>
					)}
				</div>
			)}

			{/* ОБЁРТКА, по которой меряем ширину */}
			<div ref={wrapRef}>
				<motion.div
					key={`${title}|${visible.length}|${products.length}`}
					variants={GRID_BLOCK}
					initial='hidden'
					animate='show'
					className='grid
            justify-center
            gap-[11px]
            overflow-visible
            md:mx-[-8px] lg:mx-[-12px] xl:mx-[-16px]
            xl:px-1'
					style={{
						gridTemplateColumns: `repeat(${Math.max(
							visible.length || 1,
							1
						)}, ${CARD_W}px)`,
						willChange: 'opacity, transform',
					}}
				>
					{loading
						? Array.from({ length: Math.max(cols || 1, 1) }).map((_, i) => (
								<ProductCardMiniSkeleton key={i} />
						  ))
						: visible.map(p => (
								<div key={p.id}>
									<ProductCardMini product={p} onSelect={onSelectProduct} />
								</div>
						  ))}
				</motion.div>
			</div>
		</section>
	)
}

export default ProductSection
