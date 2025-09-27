import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import ProductCardMiniSkeleton from '../ProductCardMini/parts/ProductCardMiniSkeleton'

const ProductSection = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
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

	// единый мягкий эффект: без «заезда вниз», чтобы низ не резало
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

	return (
		<section className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h3 className='text-[18px] lowercase font-baron pl-5'>{title}</h3>
				{!loading && products.length > 5 && (
					<button
						type='button'
						onClick={handleOpenMore}
						className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer pr-[23px]'
					>
						посмотреть ещё
					</button>
				)}
			</div>

			{/* overflow-visible + небольшой нижний паддинг, чтобы анимация не упиралась в край */}
			<div className='grid grid-cols-5 gap-[11px] p-2.5 overflow-visible pb-3'>
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
