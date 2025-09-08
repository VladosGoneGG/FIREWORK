import ProductCardMini from '../ProductCardMini/ProductCardMini'

export default function SubcategoryPanel({
	title,
	products = [],
	onClose,
	onSelectProduct,
	onOpenFilters,
}) {
	const isEmpty = !Array.isArray(products) || products.length === 0

	return (
		<div className='w-full h-full flex flex-col rounded-b-[20px] bg-white'>
			{/* Header */}
			<div className='flex items-center gap-2 mb-3'>
				<button
					type='button'
					onClick={onClose}
					className='text-[12px] px-2 py-1 rounded hover:bg-[#efebe6]'
				>
					←
				</button>
				<div className='text-lg font-baron'>{title}</div>

				<button
					type='button'
					onClick={onOpenFilters}
					className='ml-auto w-16 h-6 px-[5px] py-1 rounded-[10px]
                     text-white text-[10px] font-baron
                     bg-firework-radial hover:bg-firework-hover active:bg-firework-active'
				>
					Фильтр
				</button>
			</div>

			{/* Grid / empty */}
			{isEmpty ? (
				<div className='flex-1 grid place-items-center text-sm text-[#625a51]'>
					В этой подкатегории пока ничего не найдено
				</div>
			) : (
				<div className='grid grid-cols-5 p-2.5 gap-2.5 overflow-y-auto scroll-hidden'>
					{products.map(p => (
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
