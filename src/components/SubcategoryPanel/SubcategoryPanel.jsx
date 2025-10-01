// src/components/SubcategoryPanel/SubcategoryPanel.jsx
import { useMemo } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import SortDropdown from '../ui/SortDropdown'

/**
 * Props:
 * - title: string                      // заголовок текущей подкатегории
 * - leftLabel?: string | ReactNode     // метка слева (например, "акции")
 * - leftLabelMoreText?: string         // текст кнопки под меткой (по умолчанию "посмотреть ещё")
 * - onLeftLabelMore?: () => void       // клик по "посмотреть ещё"
 * - products: array
 * - onSelectProduct: (p) => void
 * - onOpenFilters: () => void
 * - filtersOpen: boolean
 * - sortKey?: string
 * - onChangeSort?: (v) => void
 */
export default function SubcategoryPanel({
	title,
	leftLabel,
	leftLabelMoreText = 'посмотреть ещё',
	onLeftLabelMore,
	products = [],
	onSelectProduct,
	onOpenFilters,
	filtersOpen = false,
	sortKey,
	onChangeSort,
}) {
	const items = useMemo(
		() => (Array.isArray(products) ? products : []),
		[products]
	)
	const isEmpty = items.length === 0

	return (
		<div className='w-full h-full flex flex-col rounded-b-[20px] bg-white overflow-hidden'>
			{/* header */}
			<div className='sticky top-0 z-10 bg-white'>
				<div className='px-2.5 py-2'>
					<div className='flex items-start gap-3'>
						{/* ЛЕВАЯ КОЛОНКА: "акции" + "посмотреть ещё" */}
						{leftLabel ? (
							<div className='pl-1 flex flex-col gap-1 shrink-0'>
								<h3 className='text-[18px] lowercase font-baron leading-none text-black'>
									{leftLabel}
								</h3>
								{typeof onLeftLabelMore === 'function' && (
									<button
										type='button'
										onClick={onLeftLabelMore}
										className='text-[10px] text-black lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'
									>
										{leftLabelMoreText}
									</button>
								)}
							</div>
						) : null}

						{/* СЕРЕДИНА: заголовок текущей подкатегории */}
						<div className='min-w-0'>
							<div className='lowercase text-lg font-baron leading-none text-[#625A51]'>
								{title}
							</div>
						</div>

						{/* ПРАВАЯ КОЛОНКА: фильтр и сортировка */}
						<div className='ml-auto flex items-center gap-2'>
							<button
								type='button'
								onClick={onOpenFilters}
								aria-pressed={filtersOpen}
								title='Открыть фильтры'
								className={[
									'w-[75px] h-[25px] px-[5px] py-1 rounded-[10px] font-baron text-[10px]',
									filtersOpen
										? 'bg-[#EFEBE7] text-[#BD52E9]'
										: 'btn-firework-filter',
								].join(' ')}
							>
								<span>фильтр</span>
							</button>

							{typeof sortKey !== 'undefined' &&
								typeof onChangeSort === 'function' && (
									<SortDropdown value={sortKey} onChange={onChangeSort} />
								)}
						</div>
					</div>
				</div>
			</div>

			{/* контент */}
			{isEmpty ? (
				<div className='flex-1 grid place-items-center text-sm text-[#625a51]'>
					В этой подкатегории пока ничего не найдено
				</div>
			) : (
				<div className='flex-1 grid grid-cols-5 p-2.5 gap-2.5 overflow-y-auto scroll-hidden'>
					{items.map(p => (
						<ProductCardMini
							key={p.id}
							product={p}
							onSelect={onSelectProduct}
						/>
					))}
				</div>
			)}
		</div>
	)
}
