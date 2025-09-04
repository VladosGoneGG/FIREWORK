import { useEffect, useMemo, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

const ProductSection = ({ title, products }) => {
	const [visibleCount, setVisibleCount] = useState(5)
	useEffect(() => {
		setVisibleCount(5)
	}, [products])
	const visible = useMemo(
		() => products.slice(0, visibleCount),
		[products, visibleCount]
	)
	const canMore = products.length > visibleCount

	return (
		<section className='space-y-3 p-2.5'>
			<div className='flex items-center justify-between'>
				<h3 className='uppercase font-inter font-bold text-[18px]'>{title}</h3>
				{canMore && (
					<button
						className='font-inter font-bold uppercase text-[10px] px-3 h-[28px] text-[#625A51] hover:text-firework-red transition'
						onClick={() => setVisibleCount(c => c + 5)}
					>
						посмотреть еще
					</button>
				)}
			</div>

			<div className='grid grid-cols-5 gap-[11px] max-[1200px]:grid-cols-4 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2'>
				{visible.map(p => (
					<ProductCardMini key={p.id} product={p} />
				))}
			</div>
		</section>
	)
}

export default ProductSection
