// src/components/SubcategoryPanel/SubcategoryPanel.jsx
import { useMemo } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import SortDropdown from '../ui/SortDropdown'

export default function SubcategoryPanel({
	title,
	products = [],
	onSelectProduct,
	onOpenFilters, // дергаем из App/ProductPage
	filtersOpen = false, // контролируемое состояние кнопки
	sortKey, // SORT_KEYS.*
	onChangeSort, // setSortKey
}) {
	const items = useMemo(
		() => (Array.isArray(products) ? products : []),
		[products]
	)
	const isEmpty = items.length === 0

	return (
		<div className='w-full h-full flex flex-col rounded-b-[20px] bg-white overflow-hidden'>
			{/* header: стили в духе SubcategoryOverlay */}
			<div className='sticky top-0 z-10 bg-white relative'>
				<div className='px-2.5 py-2'>
					<div className='flex items-center gap-2'>
						<div className='text-[#625A51] text-lg font-baron'>{title}</div>
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
