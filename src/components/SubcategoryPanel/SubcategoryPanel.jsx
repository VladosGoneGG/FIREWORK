// src/components/SubcategoryPanel/SubcategoryPanel.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import ProductCardMiniMobile from '../LayoutMobile/parts/ProductCardMiniMobile'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import SortDropdown from '../ui/SortDropdown'

const CARD_W = 121
const EXPANDED_W = 150
const FEW_PER_ROW_LIMIT = 4 // если товаров ≤ 4 — расширяем карточки

/**
 * Props:
 * - title: string
 * - products: array
 * - onSelectProduct: (product) => void
 * - onOpenFilters?: () => void
 * - filtersOpen?: boolean
 * - sortKey?: string
 * - onChangeSort?: (key) => void
 * - mobile?: boolean   // если true — рисуем мобильные карточки и мобильную сетку
 */
const SubcategoryPanel = memo(function SubcategoryPanel({
	title = 'Категория',
	products = [],
	onSelectProduct,
	onOpenFilters,
	filtersOpen = false,
	sortKey,
	onChangeSort,
	mobile = false,
}) {
	const items = useMemo(
		() => (Array.isArray(products) ? products : []),
		[products]
	)

	const FX = {
		initial: { opacity: 0, y: -8 },
		enter: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.14, ease: 'easeOut' },
		},
		exit: { opacity: 0, y: -8, transition: { duration: 0.12, ease: 'easeIn' } },
	}

	// десктоп: если товаров мало — расширяем карточки
	const fewDesktopItems =
		!mobile && items.length > 0 && items.length <= FEW_PER_ROW_LIMIT

	const mobileGrid =
		'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ' +
		'gap-[10px] justify-items-center md:justify-items-stretch py-2.5 px-2'

	const desktopContainer =
		'flex flex-wrap justify-start gap-[10px]  py-2.5 overflow-visible '

	return (
		<section>
			{/* Хедер */}
			<div className='flex items-start justify-between pl-1 '>
				<h3 className='text-[18px] lowercase font-baron '>{title}</h3>

				{/* правый блок: фильтр + сортировка */}
				<div className='ml-auto flex items-end gap-2 '>
					{onOpenFilters && (
						<button
							type='button'
							onClick={onOpenFilters}
							className={[
								'hidden min-[1040px]:inline-flex',
								'w-[70px] h-[26.5px] px-[5px] py-1 rounded-[10px] font-baron text-[10px]',
								'items-center justify-center text-center select-none',
								'focus:outline-none',
								filtersOpen
									? 'bg-[#EFEBE6] text-[#BD52E9]'
									: 'btn-firework-filter',
								'justify-center',
							].join(' ')}
						>
							<p className='block pb-[2px] w-full text-center leading-none pointer-events-none'>
								фильтр
							</p>
						</button>
					)}
					{typeof sortKey !== 'undefined' &&
						typeof onChangeSort === 'function' && (
							<SortDropdown value={sortKey} onChange={onChangeSort} />
						)}
				</div>
			</div>

			{/* Контент */}
			<div className={mobile ? mobileGrid : desktopContainer}>
				<AnimatePresence initial={false} mode='sync'>
					{items.map(p => (
						<motion.div
							key={p.id ?? `${p.name}-${p.category}-${p.subcategory}`}
							layout='position'
							initial={FX.initial}
							animate={FX.enter}
							exit={FX.exit}
							style={{
								willChange: 'opacity, transform',
								// на десктопе даём адаптивную ширину карточке
								...(mobile
									? {}
									: {
											width: fewDesktopItems ? EXPANDED_W : CARD_W,
									  }),
							}}
							className={mobile ? 'w-full ' : undefined}
						>
							{mobile ? (
								<ProductCardMiniMobile product={p} onSelect={onSelectProduct} />
							) : (
								<ProductCardMini product={p} onSelect={onSelectProduct} />
							)}
						</motion.div>
					))}
				</AnimatePresence>
			</div>

			{!items.length && (
				<div className='text-center text-neutral-400 py-8'>
					Ничего не найдено
				</div>
			)}
		</section>
	)
})

export default SubcategoryPanel
