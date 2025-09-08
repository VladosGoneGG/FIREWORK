import { memo } from 'react'
import ProductCardMini from '../../ProductCardMini/ProductCardMini'

/**
 * Props:
 * - related: Product[]
 * - currentCategory: string
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory: (categoryString) => void
 */
const RelatedBlock = ({
	related = [],
	currentCategory,
	onSelectProduct,
	onOpenSubcategory,
}) => {
	if (!related.length) return null

	return (
		<>
			<div className='flex items-center font-baron text-[18px] justify-between'>
				<div className='font-semibold'>добавь в набор</div>
				<button
					type='button'
					onClick={() => onOpenSubcategory?.(currentCategory)} // ← только строка
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
						onSelect={() => onSelectProduct?.(p)}
					/>
				))}
			</div>
		</>
	)
}

export default memo(RelatedBlock)
