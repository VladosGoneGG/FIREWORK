// src/components/ProductSection/ProductSection.jsx
import { AnimatePresence, motion } from 'motion/react'
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

	const FX_IN = {
		opacity: 1,
		y: 0,
		transition: { duration: 0.14, ease: 'easeOut' },
	}
	const FX_OUT = {
		opacity: 0,
		y: -8,
		transition: { duration: 0.12, ease: 'easeIn' },
	}

	const hasMore = !loading && products.length > visibleCount

	return (
		<section className='space-y-3'>
			{showHeader && (
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0'>
					<h3 className='text-[16px] sm:text-[18px] lowercase font-baron pl-5'>
						{title}
					</h3>

					{hasMore && (
						<button
							type='button'
							onClick={handleOpenMore}
							className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start pr-2.5'
						>
							посмотреть ещё
						</button>
					)}
				</div>
			)}

			{/* сетка: фикс-ячейка 120×206; на lg — строго 5 колонок */}
			<div
				className='
          grid
          [grid-template-columns:repeat(auto-fill,120px)]
          auto-rows-[206px]
          justify-center
          gap-[11px]
          p-2.5 pb-3 overflow-visible

            
        '
			>
				{loading ? (
					Array.from({ length: 10 }).map((_, i) => (
						<ProductCardMiniSkeleton key={i} />
					))
				) : (
					<AnimatePresence initial={false} mode='sync'>
						{visible.map(p => (
							<motion.div
								key={p.id}
								layout='position'
								initial={{ opacity: 0, y: -8 }}
								animate={FX_IN}
								exit={FX_OUT}
								style={{ willChange: 'opacity, transform' }}
							>
								<ProductCardMini product={p} onSelect={onSelectProduct} />
							</motion.div>
						))}
					</AnimatePresence>
				)}
			</div>
		</section>
	)
}

export default ProductSection
