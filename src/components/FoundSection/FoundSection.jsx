import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import ProductCardMiniMobile from '../LayoutMobile/parts/ProductCardMiniMobile'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

/**
 * Props:
 * - products: array
 * - onSelectProduct: (product) => void
 */
const FoundSection = ({ products = [], onSelectProduct }) => {
	const items = useMemo(
		() => (Array.isArray(products) ? products : []),
		[products]
	)

	if (!items.length) {
		return (
			<div className='px-3 py-6'>
				<div className='text-center text-[#625a51] text-sm font-baron'>
					ничего не найдено
				</div>
			</div>
		)
	}

	const EASE = 'easeOut'
	const DURATION = 0.15
	const GRID_BLOCK = {
		hidden: { opacity: 0, y: 14 },
		show: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION } },
	}

	const gridKey = `found|${items.length}`

	return (
		<section>
			{/* МОБИЛЬНЫЕ КАРТОЧКИ */}
			<div className='block min-[1040px]:hidden'>
				<motion.div
					key={`${gridKey}-m`}
					variants={GRID_BLOCK}
					initial='hidden'
					animate='show'
					className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-[10px]'
					style={{ willChange: 'opacity, transform' }}
				>
					{items.map(p => (
						<div key={p.id || p.sku || p.name} className='w-full'>
							<ProductCardMiniMobile product={p} onSelect={onSelectProduct} />
						</div>
					))}
				</motion.div>
			</div>

			{/* ДЕСКТОПНЫЕ КАРТОЧКИ */}
			<div className='hidden min-[1040px]:block'>
				<motion.div
					key={`${gridKey}-d`}
					variants={GRID_BLOCK}
					initial='hidden'
					animate='show'
					className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]'
					style={{ willChange: 'opacity, transform' }}
				>
					{items.map(p => (
						<div key={p.id || p.sku || p.name} className='w-full'>
							<ProductCardMini product={p} onSelect={onSelectProduct} />
						</div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

export default memo(FoundSection)
