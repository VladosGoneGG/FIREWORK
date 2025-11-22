// src/components/ProductSection/ProductSection.jsx
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'
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

// карточка у тебя w-[121px]
const CARD_W = 121
const GAP = 11
const VISIBLE_COUNT = 5
const CONTAINER_W = CARD_W * VISIBLE_COUNT + GAP * (VISIBLE_COUNT - 1) // 649px
const END_PADDING = 50
const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
	showHeader = true,
}) => {
	const hasProducts = products && products.length > 0
	const skeletonCount = useMemo(
		() =>
			hasProducts ? Math.min(products.length, VISIBLE_COUNT) : VISIBLE_COUNT,
		[hasProducts, products.length]
	)

	const hasMore = !loading && products.length > 0 && !!onOpenSubcategory
	const handleOpenMore = () => {
		if (onOpenSubcategory) onOpenSubcategory({ title, products })
	}

	const EASE = 'easeOut'
	const DURATION = 0.15
	const GRID_BLOCK = {
		hidden: { opacity: 0, y: 14 },
		show: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION } },
	}

	// ===== горизонтальный скролл и блокировка скролла страницы =====
	const scrollRef = useRef(null)
	const animRef = useRef(null)

	const smoothScrollTo = useCallback(target => {
		const el = scrollRef.current
		if (!el) return

		if (animRef.current) {
			cancelAnimationFrame(animRef.current)
		}

		const start = el.scrollLeft
		const distance = target - start
		if (distance === 0) return

		const duration = 260 // ms
		const startTime = performance.now()

		const step = now => {
			const t = Math.min(1, (now - startTime) / duration)
			// easeOutCubic
			const eased = 1 - Math.pow(1 - t, 3)
			el.scrollLeft = start + distance * eased
			if (t < 1) {
				animRef.current = requestAnimationFrame(step)
			}
		}

		animRef.current = requestAnimationFrame(step)
	}, [])

	const handleWheel = event => {
		const el = scrollRef.current
		if (!el) return

		const maxScroll = el.scrollWidth - el.clientWidth
		if (maxScroll <= 0) return

		// блокируем скролл страницы, пока мышь в зоне карточек
		event.preventDefault()

		const { deltaX, deltaY } = event
		const absX = Math.abs(deltaX)
		const absY = Math.abs(deltaY)

		// доминирующее направление
		const delta = absX > absY ? deltaX : deltaY
		if (!delta) return

		const factor = 1.3 // делаем движение мягче
		const current = el.scrollLeft
		const next = current + delta * factor
		const clamped = Math.max(0, Math.min(maxScroll, next))

		smoothScrollTo(clamped)
	}

	return (
		<section>
			{showHeader && (
				<div className='flex justify-between'>
					<h3 className='text-[18px] mt-[1px] lowercase font-baron pl-2.5 mb-1.5'>
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

			{/* ВЕСЬ КОНТЕЙНЕР — зона горизонтального скролла */}
			<div
				ref={scrollRef}
				onWheel={handleWheel}
				className={[
					'relative',
					'overflow-x-auto overflow-y-visible',
					// прячем полосы прокрутки
					'[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
					// твои отступы, как и были
					'md:mx-[-8px] lg:mx-[-12px] xl:mx-[-16px]',
					'xl:px-1',
					// чтобы скролл не пробивался наружу
					'[overscroll-behavior-x:contain] [overscroll-behavior-y:none]',
				].join(' ')}
				style={{
					width: CONTAINER_W, // показываем ровно 5 карточек
					maxWidth: '100%',
					marginLeft: 'auto',
					marginRight: 'auto',
				}}
			>
				<motion.div
					key={`${title}|${products.length}|${loading ? 'loading' : 'ready'}`}
					variants={GRID_BLOCK}
					initial='hidden'
					animate='show'
					className={[
						'flex flex-nowrap gap-[8px]',
						'justify-start',
						// плавность при программных скроллах
						'scroll-smooth',
						'snap-x snap-mandatory',
					].join(' ')}
					style={{
						willChange: 'opacity, transform',
						// чуть больше, чем одна карточка, чтобы последняя точно влезала
						paddingRight: END_PADDING,
					}}
				>
					{loading
						? Array.from({ length: skeletonCount }).map((_, i) => (
								<div
									key={i}
									className='snap-start shrink-0'
									style={{ width: CARD_W }}
								>
									<ProductCardMiniSkeleton />
								</div>
						  ))
						: products.map(p => (
								<div
									key={p.id}
									className='snap-start shrink-0'
									style={{ width: CARD_W }}
								>
									<ProductCardMini product={p} onSelect={onSelectProduct} />
								</div>
						  ))}
				</motion.div>
			</div>
		</section>
	)
}

export default ProductSection
