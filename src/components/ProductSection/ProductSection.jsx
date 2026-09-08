// src/components/ProductSection/ProductSection.jsx
import { useMemo } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import ProductCardMiniSkeleton from '../ProductCardMini/parts/ProductCardMiniSkeleton'

const CARD_W = 121
const MAX_ITEMS = 15

function getVisibleCount(total) {
	if (total <= 5) return total
	if (total <= 10) return 5
	if (total <= 15) return 10
	return MAX_ITEMS
}

const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
	showHeader = true,
	uncapped = false,
}) => {
	const hasProducts = products && products.length > 0
	const total = hasProducts ? products.length : 0

	const visibleCount = hasProducts
		? uncapped
			? total
			: getVisibleCount(total)
		: 0

	const visibleProducts = useMemo(
		() =>
			hasProducts && visibleCount > 0 ? products.slice(0, visibleCount) : [],
		[hasProducts, products, visibleCount],
	)

	const skeletonCount = useMemo(
		() => (hasProducts ? visibleCount || 5 : 5),
		[hasProducts, visibleCount],
	)

	const hasMore =
		!loading &&
		hasProducts &&
		typeof onOpenSubcategory === 'function' &&
		products.length > visibleProducts.length

	const handleOpenMore = () => {
		if (onOpenSubcategory) onOpenSubcategory({ title, products })
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

			<div
				className='grid gap-2.5'
				style={{
					// Фиксированная ширина колонки (не диапазон до 150px) — иначе
					// auto-fill считает число колонок по МАКСИМУМУ minmax и влезает
					// на строку меньше карточек, чем реально помещается по 121px.
					gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`,
				}}
			>
				{loading
					? Array.from({ length: skeletonCount }).map((_, i) => (
							<div key={i}>
								<ProductCardMiniSkeleton />
							</div>
						))
					: visibleProducts.map(p => (
							<div key={p.id}>
								<ProductCardMini product={p} onSelect={onSelectProduct} />
							</div>
						))}
			</div>
		</section>
	)
}

export default ProductSection
