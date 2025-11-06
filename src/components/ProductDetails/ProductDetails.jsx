// src/components/ProductDetails/ProductDetails.jsx
import { memo, useEffect } from 'react'
import fireworksSvg from '../../assets/SVG/fireworksSvg.svg'
import DescriptionBlock from './parts/DescriptionBlock'
import MediaBlock from './parts/MediaBlock'
import RelatedBlock from './parts/RelatedBlock'
import SideInfoCard from './parts/SideInfoCard'

const ProductDetails = ({
	product,
	related = [],
	onBack,
	onOpenSubcategory,
	onSelectProduct,
}) => {
	if (!product) return null

	const img = product.images?.[0]
	const inStock = Number.isFinite(product.stock) ? product.stock : 15

	// Закрытие деталей при навигации (мобилка)
	useEffect(() => {
		const isMobile = () =>
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(max-width: 1040px)').matches

		const handleNav = () => {
			if (!isMobile()) return
			try {
				onBack?.()
			} catch {}
		}

		window.addEventListener('nav:category-picked', handleNav)
		window.addEventListener('nav:open-subcategory', handleNav)
		return () => {
			window.removeEventListener('nav:category-picked', handleNav)
			window.removeEventListener('nav:open-subcategory', handleNav)
		}
	}, [onBack])

	return (
		<section
			className={[
				'bg-white rounded-[20px] w-full h-auto overflow-visible flex flex-col',
				'max-[1040px]:mt-16',
				// ⬇️ min-h на ДЕСКТОПЕ, а на мобиле — убираем
				'min-[1041px]:min-h-[834px] max-[1040px]:min-h-0',
			].join(' ')}
		>
			<div
				className={[
					'px-2.5 pt-2.5 pb-[15px] flex flex-col',
					// ⬇️ убираем растягивание с пустотой и двойной min-h
					// было: 'justify-between min-h-[834px]'
					'gap-2.5',
					'min-[1041px]:min-h-[834px] max-[1040px]:min-h-0',
					'flex-1',
				].join(' ')}
			>
				{/* верх: медиа + правая колонка */}
				<div className='flex flex-col min-[681px]:flex-row gap-2.5 flex-none min-[681px]:items-stretch'>
					<MediaBlock img={fireworksSvg} name={product.name} onBack={onBack} />
					<SideInfoCard product={product} img={img} inStock={inStock} />
				</div>

				{/* низ: GRID — 1fr (описание) + auto (Related) */}
				<div className='flex-1 min-h-0 grid grid-rows-[1fr_auto] gap-2.5'>
					{/* строка 1: растягивается, внутри — собственный скролл */}
					<DescriptionBlock
						description={product.description}
						certificateNumber={product?.certificateNumber}
						className='min-h-0' // важно оставить min-h-0
					/>

					{/* строка 2: остаётся у низа */}
					<div className='w-full flex flex-col justify-end'>
						<RelatedBlock
							related={related}
							currentCategory={product.category}
							onSelectProduct={onSelectProduct}
							onOpenSubcategory={payload => onOpenSubcategory?.(payload)}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

export default memo(ProductDetails)
