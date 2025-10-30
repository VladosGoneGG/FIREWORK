// src/components/FoundSection/FoundSection.jsx
import { AnimatePresence, motion } from 'framer-motion'
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

	const FX_IN = {
		opacity: 1,
		x: 0,
		transition: { duration: 0.15, ease: 'easeOut' },
	}
	const FX_OUT = {
		opacity: 0,
		x: -8,
		transition: { duration: 0.12, ease: 'easeIn' },
	}

	return (
		<section className='px-3 py-3'>
			{/* МОБИЛЬНЫЕ КАРТОЧКИ: показываем только ниже 1040px */}
			<div className='block min-[1040px]:hidden'>
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-[10px]'>
					<AnimatePresence initial={false} mode='sync'>
						{items.map(p => (
							<motion.div
								key={p.id || p.sku || p.name}
								layout='position'
								initial={{ opacity: 0, x: -6 }}
								animate={FX_IN}
								exit={FX_OUT}
								style={{ willChange: 'opacity, transform' }}
								className='w-full'
							>
								<ProductCardMiniMobile product={p} onSelect={onSelectProduct} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* ДЕСКТОПНЫЕ КАРТОЧКИ: показываем на 1040px и выше */}
			<div className='hidden min-[1040px]:block'>
				{/* 1 / 2 / 3 / 4 / 5 колонок как было */}
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]'>
					<AnimatePresence initial={false} mode='sync'>
						{items.map(p => (
							<motion.div
								key={p.id || p.sku || p.name}
								layout='position'
								initial={{ opacity: 0, x: -6 }}
								animate={FX_IN}
								exit={FX_OUT}
								style={{ willChange: 'opacity, transform' }}
								className='w-full'
							>
								<ProductCardMini product={p} onSelect={onSelectProduct} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</section>
	)
}

export default memo(FoundSection)
