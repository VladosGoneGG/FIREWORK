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
		onOpenSubcategory?.({ title: currentCategory })
	}

	return (
		<>
			<div className='flex items-center font-baron text-[18px] justify-between'>
				<div className='font-semibold'>добавь в набор</div>
				<button
					type='button'
					onClick={openMore}
					className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5]'
				>
					посмотреть ещё
				</button>
			</div>

			<div className='grid grid-cols-7 gap-2.5 overflow-y-auto scroll-hidden'>
				{related.slice(0, 7).map(p => (
					<ProductCardMini
						key={p.id}
						product={p}
						onSelect={() => onSelectProduct?.(p)} // ← открыть этот товар в деталях
					/>
				))}
			</div>
		</>
	)
}

export default memo(RelatedBlock)
