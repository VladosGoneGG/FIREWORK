import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../ProductCard/ProductCard'

const ProductSection = ({ title, products }) => {
	const [visibleCount, setVisibleCount] = useState(5)

	// Сброс при изменении входных данных
	useEffect(() => {
		setVisibleCount(5)
	}, [products])

	const visible = useMemo(
		() => products.slice(0, visibleCount),
		[products, visibleCount]
	)

	return (
		<section className='space-y-3'>
			<h3 className='text-lg font-semibold'>{title}</h3>
			<div className='grid grid-cols-1 gap-3'>
				{visible.map(p => (
					<ProductCard key={p.id} product={p} />
				))}
			</div>

			{products.length > visibleCount && (
				<button
					className='btn-firework w-full'
					onClick={() => setVisibleCount(c => c + 5)}
				>
					посмотреть ещё
				</button>
			)}
		</section>
	)
}

export default ProductSection
