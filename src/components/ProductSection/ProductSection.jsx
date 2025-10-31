import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import ProductCardMiniSkeleton from '../ProductCardMini/parts/ProductCardMiniSkeleton'

/**
 * Props:
 * - title: string
 * - products: array
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory: ({ title, products }) => void
 * - loading: boolean
 * - showHeader?: boolean
 */
const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
	showHeader = true,
}) => {
	const [visibleCount, setVisibleCount] = useState(5)

	useEffect(() => {
		setVisibleCount(Math.min(5, products.length || 0))
	}, [products])

	const visible = useMemo(
		() => products.slice(0, visibleCount),
		[products, visibleCount]
	)

	const handleOpenMore = () => {
		if (onOpenSubcategory) {
			onOpenSubcategory({ title, products })
		} else {
			setVisibleCount(c => Math.min(c + 5, products.length))
		}
	}

	const EASE = 'easeOut'
	const DURATION = 0.15
	// Анимируем весь грид одним блоком
	const GRID_BLOCK = {
		hidden: { opacity: 0, y: 14 },
		show: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION } },
	}

	const hasMore = !loading && products.length > visibleCount

	return (
		<section className='space-y-3'>
			{showHeader && (
				<div className='flex items-center justify-between'>
					<h3 className='text-[18px] lowercase font-baron pl-5'>{title}</h3>

					{hasMore && (
						<button
							type='button'
							onClick={handleOpenMore}
							className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer pr-[23px]'
						>
							посмотреть ещё
						</button>
					)}
				</div>
			)}

			<motion.div
				key={`${title}|${visible.length}|${products.length}`}
				variants={GRID_BLOCK}
				initial='hidden'
				animate='show'
				className='  grid
    [grid-template-columns:repeat(auto-fill,120px)]
    xl:[grid-template-columns:repeat(5,120px)]
    justify-center
    gap-[11px]
    p-2.5 pb-3 overflow-visible

    md:mx-[-8px] lg:mx-[-12px] xl:mx-[-16px]
   
    xl:px-1'
				style={{ willChange: 'opacity, transform' }}
			>
				{loading
					? Array.from({ length: 10 }).map((_, i) => (
							<ProductCardMiniSkeleton key={i} />
					  ))
					: visible.map(p => (
							<div key={p.id}>
								<ProductCardMini product={p} onSelect={onSelectProduct} />
							</div>
					  ))}
			</motion.div>
		</section>
	)
}

export default ProductSection
