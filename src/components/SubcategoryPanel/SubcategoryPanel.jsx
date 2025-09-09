import { useMemo, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import SortDropdown from '../ui/SortDropdown'

export default function SubcategoryPanel({
	title,
	products = [],
	onClose,
	onSelectProduct,
	onOpenFilters,
}) {
	const [sortBy, setSortBy] = useState('price-asc')

	const sortedProducts = useMemo(() => {
		if (!Array.isArray(products)) return []
		const getUnitPrice = p =>
			typeof p?.discountPrice === 'number'
				? p.discountPrice
				: typeof p?.price === 'number'
				? p.price
				: Number.POSITIVE_INFINITY

		const arr = [...products]
		if (sortBy === 'price-asc') {
			arr.sort((a, b) => getUnitPrice(a) - getUnitPrice(b))
		} else if (sortBy === 'price-desc') {
			arr.sort((a, b) => getUnitPrice(b) - getUnitPrice(a))
		}
		return arr
	}, [products, sortBy])

	const isEmpty = !sortedProducts.length

	return (
		<div className='w-full h-full flex flex-col  rounded-b-[20px] bg-white'>
			{/* Header */}
			<div className='flex items-center gap-2 p-2.5'>
				<div className='pl-2.5 text-lg font-baron'>{title}</div>

				{/* справа: сортировка + фильтр */}
				<div className='ml-auto flex items-center gap-2'>
					<button
						type='button'
						onClick={onOpenFilters}
						className='w-16 h-6 px-[5px] py-1 rounded-[10px] cursor-pointer
                       text-white text-[10px] font-baron btn-firework'
					>
						Фильтр
					</button>
					<SortDropdown value={sortBy} onChange={setSortBy} />
				</div>
			</div>

			{/* Grid / empty */}
			{isEmpty ? (
				<div className='flex-1 grid place-items-center text-sm text-[#625a51]'>
					В этой подкатегории пока ничего не найдено
				</div>
			) : (
				<div className='grid grid-cols-5 p-2.5 gap-2.5 overflow-y-auto scroll-hidden'>
					{sortedProducts.map(p => (
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
