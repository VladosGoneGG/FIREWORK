// src/components/ProductSection/ProductSection.jsx
import { motion } from 'motion/react'
import { useMemo } from 'react'
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

// карточка у тебя w-[121px]
const CARD_W = 121
const MAX_ITEMS = 15 // жёсткий максимум

// ступенчатое количество видимых карточек
function getVisibleCount(total) {
	if (total <= 5) return total // 1–5 показываем все
	if (total <= 10) return 5 // 6–10 → 5
	if (total <= 15) return 10 // 11–15 → 10
	return MAX_ITEMS // >15 → 15
}

const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
	showHeader = true,
}) => {
	const hasProducts = products && products.length > 0
	const total = hasProducts ? products.length : 0

	const visibleCount = hasProducts ? getVisibleCount(total) : 0

	const visibleProducts = useMemo(
		() =>
			hasProducts && visibleCount > 0 ? products.slice(0, visibleCount) : [],
		[hasProducts, products, visibleCount]
	)

	const skeletonCount = useMemo(
		() => (hasProducts ? visibleCount || 5 : 5),
		[hasProducts, visibleCount]
	)

	const hasMore =
		!loading &&
		hasProducts &&
		typeof onOpenSubcategory === 'function' &&
		products.length > visibleProducts.length

	const handleOpenMore = () => {
		if (onOpenSubcategory) onOpenSubcategory({ title, products })
	}

	const EASE = 'easeOut'
	const DURATION = 0.15
	const GRID_BLOCK = {
		hidden: { opacity: 0, y: 14 },
		show: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION } },
	}

	return (
		<section>
			{showHeader && (
				<div className='flex justify-between'>
					<h3 className='text-[18px] mt-[1px] lowercase font-baron pl-2.5 mb-1.5'>
						{title}
					</h3>

					{hasMore && (
						<button
							type='button'
							onClick={handleOpenMore}
							className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer pr-[10px]'
						>
							посмотреть ещё
						</button>
					)}
				</div>
			)}

			<motion.div
				key={`${title}|${visibleProducts.length}|${
					loading ? 'loading' : 'ready'
				}`}
				variants={GRID_BLOCK}
				initial='hidden'
				animate='show'
				className={[
					// сетка карточек
					'flex flex-wrap justify-center gap-[11px]',
					// твои отрицательные отступы, как были
					'md:mx-[-8px] lg:mx-[-12px] xl:mx-[-16px]',
					'xl:px-1',
				].join(' ')}
				style={{
					willChange: 'opacity, transform',
				}}
			>
				{loading
					? Array.from({ length: skeletonCount }).map((_, i) => (
							<div key={i} className='shrink-0' style={{ width: CARD_W }}>
								<ProductCardMiniSkeleton />
							</div>
					  ))
					: visibleProducts.map(p => (
							<div key={p.id} className='shrink-0' style={{ width: CARD_W }}>
								<ProductCardMini product={p} onSelect={onSelectProduct} />
							</div>
					  ))}
			</motion.div>
		</section>
	)
}

export default ProductSection
