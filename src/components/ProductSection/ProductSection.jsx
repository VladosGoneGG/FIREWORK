import { useEffect, useMemo, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import ProductCardMiniSkeleton from '../ProductCardMini/parts/ProductCardMiniSkeleton'

const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false, // ← новое
}) => {
	const [visibleCount, setVisibleCount] = useState(5)

	useEffect(() => {
		setVisibleCount(5)
	}, [products])

	const visible = useMemo(
		() => products.slice(0, visibleCount),
		[products, visibleCount]
	)

	const handleOpenMore = () => {
		if (onOpenSubcategory) onOpenSubcategory({ title, products })
		else setVisibleCount(c => c + 5)
	}

	return (
		<section className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h3 className='text-[18px] lowercase font-baron pl-2.5'>{title}</h3>
				{!loading && products.length > 5 && (
					<button
						type='button'
						onClick={handleOpenMore}
						className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5]'
					>
						посмотреть ещё
					</button>
				)}
			</div>

			<div className='grid grid-cols-5 gap-3'>
				{loading
					? Array.from({ length: 10 }).map((_, i) => (
							<ProductCardMiniSkeleton key={i} />
					  ))
					: visible.map(p => (
							<ProductCardMini
								key={p.id}
								product={p}
								onSelect={onSelectProduct}
							/>
					  ))}
			</div>
		</section>
	)
}

export default ProductSection
