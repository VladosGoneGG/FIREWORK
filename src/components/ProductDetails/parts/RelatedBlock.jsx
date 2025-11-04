// src/components/ProductDetails/parts/RelatedBlock.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import useMediaQuery from '../../../hooks/useMediaQuery'
import ProductCardMiniMobile from '../../LayoutMobile/parts/ProductCardMiniMobile'
import ProductCardMini from '../../ProductCardMini/ProductCardMini'

/**
 * Props:
 * - related: Product[]
 * - currentCategory: string
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory: (categoryString) => void
 */
const CARD_W = 120 // ширина карточки по макету
const GAP = 10 // gap-2.5 = 10px
const MAX_PER_ROW = 7

// мобильные ограничения: не больше 2 в ряд и не больше 3 рядов => 6 карточек
const MOBILE_MAX_PER_ROW = 2
const MOBILE_MAX_ROWS = 3
const MOBILE_LIMIT = MOBILE_MAX_PER_ROW * MOBILE_MAX_ROWS // 6

const RelatedBlock = ({
	related = [],
	currentCategory,
	onSelectProduct,
	onOpenSubcategory,
}) => {
	const isMobile = useMediaQuery('(max-width: 1040px)')

	const rowRef = useRef(null)
	const [visiblePerRow, setVisiblePerRow] = useState(MAX_PER_ROW)

	useEffect(() => {
		if (!rowRef.current) return
		const el = rowRef.current

		const computeCount = containerWidth => {
			let n = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_W + GAP)))
			n = Math.min(MAX_PER_ROW, n)

			const vw = window.innerWidth || containerWidth
			if (vw < 1125) return 5
			if (vw < 1256) return 6
			return Math.min(MAX_PER_ROW, n)
		}

		const measure = () => {
			const w = el.clientWidth || 0
			setVisiblePerRow(computeCount(w))
		}

		measure()

		let ro
		if ('ResizeObserver' in window) {
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
	}, [])

	if (!related.length) return null

	const itemsDesktop = useMemo(
		() => related.slice(0, visiblePerRow),
		[related, visiblePerRow]
	)

	// 🔸 главное изменение: на мобиле показываем только первые 6
	const itemsMobile = useMemo(() => related.slice(0, MOBILE_LIMIT), [related])

	return (
		<>
			<div className='flex items-center font-baron text-[18px] justify-between'>
				<div className='font-semibold'>добавь в набор</div>
				<button
					type='button'
					onClick={() => onOpenSubcategory?.(currentCategory)}
					className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer'
				>
					посмотреть ещё
				</button>
			</div>

			{/* Десктоп: фиксируем количество карточек по брейкпоинтам */}
			{!isMobile && (
				<div
					ref={rowRef}
					className='mt-[10px] w-full flex gap-2.5 justify-between overflow-hidden'
				>
					{itemsDesktop.map(p => (
						<div key={p.id} className='shrink-0'>
							<ProductCardMini
								product={p}
								onSelect={() => onSelectProduct?.(p)}
							/>
						</div>
					))}
				</div>
			)}

			{/* Мобилка (≤1040px): сетка как у тебя, но рендерим максимум 6 карточек */}
			{isMobile && (
				<div
					className={[
						'mt-[10px] grid gap-2.5',
						'grid-cols-1',
						'min-[560px]:grid-cols-3', // максимум 2 в ряд
					].join(' ')}
				>
					{itemsMobile.map(p => (
						<ProductCardMiniMobile
							key={p.id}
							product={p}
							onSelect={() => onSelectProduct?.(p)}
						/>
					))}
				</div>
			)}
		</>
	)
}

export default memo(RelatedBlock)
