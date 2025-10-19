// src/components/ProductDetails/parts/RelatedBlock.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import ProductCardMini from '../../ProductCardMini/ProductCardMini'

/**
 * Props:
 * - related: Product[]
 * - currentCategory: string
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory: (categoryString) => void
 */
const CARD_W = 120 // ширина карточки по твоему макету
const GAP = 10 // gap-2.5 = 10px

const RelatedBlock = ({
	related = [],
	currentCategory,
	onSelectProduct,
	onOpenSubcategory,
}) => {
	const rowRef = useRef(null)
	const [visiblePerRow, setVisiblePerRow] = useState(7) // по макету максимум 7

	// авто-подсчёт количества карточек, которые поместятся в ОДИН РЯД
	useEffect(() => {
		if (!rowRef.current) return

		const el = rowRef.current
		const measure = () => {
			const w = el.clientWidth || 0
			// сколько 120px карточек с 10px промежутком влезет:  [CARD + GAP] * n - GAP <= w
			const n = Math.max(1, Math.floor((w + GAP) / (CARD_W + GAP)))
			setVisiblePerRow(Math.min(7, n)) // не больше 7 по макету
		}

		measure()

		// ResizeObserver — чтобы реагировать на изменения ширины контейнера
		let ro
		if ('ResizeObserver' in window) {
			ro = new ResizeObserver(measure)
			ro.observe(el)
		} else {
			// fallback на ресайз окна
			window.addEventListener('resize', measure)
		}
		return () => {
			ro?.disconnect?.()
			window.removeEventListener('resize', measure)
		}
	}, [])

	if (!related.length) return null

	// рендерим столько, сколько реально влезет в один ряд
	const items = useMemo(
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

			{/* Один ряд без переноса. Кол-во элементов контролируем логикой выше */}
			<div
				ref={rowRef}
				className='mt-[10px] flex gap-2.5 overflow-hidden'
				// без wrap: все элементы в одну линию, обрезаем лишнее (но мы их не рендерим)
			>
				{items.map(p => (
					<div key={p.id} className='shrink-0'>
						<ProductCardMini
							product={p}
							onSelect={() => onSelectProduct?.(p)}
						/>
					</div>
				))}
			</div>
		</>
	)
}

export default memo(RelatedBlock)
