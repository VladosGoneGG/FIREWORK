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

const RelatedBlock = ({
	related = [],
	currentCategory,
	onSelectProduct,
	onOpenSubcategory,
}) => {
	const isMobile = useMediaQuery('(max-width: 1040px)')

	const rowRef = useRef(null)
	const [visiblePerRow, setVisiblePerRow] = useState(7) // максимум 7 по макету

	// авто-подсчёт сколько карточек влезает в один ряд (для десктопа; НЕ меняем)
	useEffect(() => {
		if (!rowRef.current) return
		const el = rowRef.current
		const measure = () => {
			const w = el.clientWidth || 0
			// [CARD + GAP] * n - GAP <= w
			const n = Math.max(1, Math.floor((w + GAP) / (CARD_W + GAP)))
			setVisiblePerRow(Math.min(7, n))
		}
		measure()

		let ro
		if ('ResizeObserver' in window) {
			ro = new ResizeObserver(measure)
			ro.observe(el)
		} else {
			window.addEventListener('resize', measure)
		}
		return () => {
			ro?.disconnect?.()
			window.removeEventListener('resize', measure)
		}
	}, [])

	if (!related.length) return null

	const itemsDesktop = useMemo(
		() => related.slice(0, visiblePerRow),
		[related, visiblePerRow]
	)

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

			{/* === Десктоп/планшет (>1040px): как было — один ряд без переноса === */}
			{!isMobile && (
				<div ref={rowRef} className='mt-[10px] flex gap-2.5 overflow-hidden'>
					{itemsDesktop.map(p => (
						<div key={p.id} className='shrink-0'>
							<ProductCardMini
								product={p}
								onSelect={() => onSelectProduct?.(p)} // без Link
							/>
						</div>
					))}
				</div>
			)}

			{/* === Мобилка (<=1040px): адаптивная сетка 1 → 2 → 3, клики открывают детали === */}
			{isMobile && (
				<div
					className={[
						'mt-[10px] grid gap-2.5',
						'grid-cols-1', // по умолчанию 1 колонка
						'min-[560px]:grid-cols-2', // шире — 2 колонки
						'min-[820px]:grid-cols-3', // ещё шире — 3 колонки
					].join(' ')}
				>
					{related.map(p => (
						<ProductCardMiniMobile
							key={p.id}
							product={p}
							onSelect={() => onSelectProduct?.(p)} // открываем через onSelectProduct
						/>
					))}
				</div>
			)}
		</>
	)
}

export default memo(RelatedBlock)
