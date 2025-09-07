// src/components/ProductDetails/parts/RelatedBlock.jsx
import { memo } from 'react'
import ProductCardMini from '../../ProductCardMini/ProductCardMini'

const RelatedBlock = ({
	related = [],
	currentCategory,
	onSelectProduct, // (product) => void
	onOpenSubcategory, // (payloadOrCategory) => void
}) => {
	if (!related.length) return null

	const openMore = () => {
		// Передаём только название категории — выше нормализуем
		onOpenSubcategory?.({ title: currentCategory })
	}

	return (
		<>
			<div className='flex items-center font-baron text-[18px] justify-between'>
				<div className='font-semibold'>добавь в набор</div>
				<button
					type='button'
					onClick={openMore}
					className='text-[12px] opacity-70 hover:opacity-100'
				>
					Посмотреть ещё
				</button>
			</div>

			<div className='grid grid-cols-7 gap-2.5 overflow-y-auto'>
				{related.slice(0, 7).map(p => (
					<ProductCardMini
						key={p.id}
						product={p}
						onSelect={() => onSelectProduct?.(p)}
					/>
				))}
			</div>
		</>
	)
}

export default memo(RelatedBlock)
