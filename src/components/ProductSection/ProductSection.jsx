// src/components/ProductSection/ProductSection.jsx
import { useEffect, useMemo, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
}) => {
	const [visibleCount, setVisibleCount] = useState(5)

	useEffect(() => {
		// при смене данных показываем снова первые 5
		setVisibleCount(5)
	}, [products])

	const visible = useMemo(
		() => products.slice(0, visibleCount),
		[products, visibleCount]
	)

	const handleOpenMore = () => {
		if (onOpenSubcategory) {
			// пробрасываем наверх, открываем SubcategoryPanel как отдельный экран
			onOpenSubcategory({ title, products })
		} else {
			// fallback, если вдруг не передали
			setVisibleCount(c => c + 5)
		}
	}

	return (
		<section className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-semibold'>{title}</h3>

				{/* маленькая кнопка “посмотреть ещё” справа */}
				{products.length > 5 && (
					<button
						type='button'
						onClick={handleOpenMore}
						className='text-[12px] opacity-70 hover:opacity-100'
					>
						Посмотреть ещё
					</button>
				)}
			</div>

			{/* сетка мини-карточек строго по 5 в ряд */}
			<div className='grid grid-cols-5 gap-3'>
				{visible.map(p => (
					<ProductCardMini
						key={p.id}
						product={p}
						onSelect={onSelectProduct} // ← клик по карточке ведёт в ProductDetails
					/>
				))}
			</div>
		</section>
	)
}

export default ProductSection
