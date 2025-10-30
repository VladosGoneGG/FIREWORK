// src/components/SubcategoryPanel/SubcategoryPanel.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import ProductCardMiniMobile from '../LayoutMobile/parts/ProductCardMiniMobile'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import SortDropdown from '../ui/SortDropdown'

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

	return (
		<section className='space-y-3'>
			{/* Хедер */}
			<div className='flex items-center justify-between'>
				<h3 className='text-[18px] lowercase font-baron pl-5'>{title}</h3>

				{/* правый блок: фильтр + сортировка */}
				<div className='ml-auto flex items-center gap-2 pr-[18px]'>
					{onOpenFilters && (
						<button
							type='button'
							onClick={onOpenFilters}
							className={[
								// скрываем кнопку на ширине < 1040px
								'hidden min-[1040px]:inline-flex',
								// БАЗА: фиксируем центрирование вне зависимости от темы/сост.
								'w-[75px] h-[25px] px-[5px] py-1 rounded-[10px] font-baron text-[10px]',
								'items-center justify-center text-center select-none',
								'focus:outline-none',
								// Состояние
								filtersOpen
									? 'bg-[#EFEBE6] text-[#BD52E9]'
									: 'btn-firework-filter',
								// Последним повторим выравнивание — на случай, если внутри btn-firework-filter есть свои justify-*
								'justify-center',
							].join(' ')}
						>
							<span className='block w-full text-center leading-none pointer-events-none'>
								фильтр
							</span>
						</button>
					)}
					{typeof sortKey !== 'undefined' &&
						typeof onChangeSort === 'function' && (
							<SortDropdown value={sortKey} onChange={onChangeSort} />
						)}
				</div>
			</div>

			{/* Контент */}
			<div
				className={
					mobile
						? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] justify-items-center md:justify-items-stretch px-2'
						: 'grid [grid-template-columns:repeat(auto-fill,120px)] xl:[grid-template-columns:repeat(5,120px)] justify-center gap-[11px] p-2.5 pb-3 overflow-visible md:mx-[-8px] lg:mx-[-12px] xl:mx-[-16px] xl:px-1'
				}
			>
				<AnimatePresence initial={false} mode='sync'>
					{items.map(p => (
						<motion.div
							key={p.id ?? `${p.name}-${p.category}-${p.subcategory}`}
							layout='position'
							initial={FX.initial}
							animate={FX.enter}
							exit={FX.exit}
							style={{ willChange: 'opacity, transform' }}
							className={mobile ? 'w-full max-w-[360px]' : undefined}
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
