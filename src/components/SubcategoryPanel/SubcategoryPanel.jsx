import ProductCardMini from '../ProductCardMini/ProductCardMini'

export default function SubcategoryPanel({
	title,
	products = [],
	onClose,
	onSelectProduct,
	onOpenFilters,
}) {
	return (
		<div className='w-full h-full flex flex-col'>
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

			{/* Grid */}
			<div className='grid grid-cols-5 gap-3 overflow-y-auto'>
				{products.map(p => (
					<ProductCardMini key={p.id} product={p} onSelect={onSelectProduct} />
				))}
			</div>
		</div>
	)
}
