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
				'bg-white rounded-[20px] max-w-[905px] overflow-visible flex flex-col pt-2.5',
				'min-[1041px]:h-[824px] max-[1040px]:mt-15 max-[1040px]:mx-2.5 max-[1040px]:max-w-[1040px]',
			].join(' ')}
		>
			<div className={['flex flex-col gap-2.5', 'flex-1 min-h-0'].join(' ')}>
				{/* верх: медиа + правая колонка */}
				<div
					className={[
						'flex flex-col', // на мобиле — колонка, высота по контенту
						'min-[681px]:flex-row', // на десктопе — в ряд
						'gap-2.5',
						'min-[681px]:gap-[10px]', // 10px между MediaBlock и SideInfoCard на десктопе
						'flex-none min-[681px]:items-stretch',
						'min-[681px]:h-[400px]', // фикс 400px ТОЛЬКО на десктопе
					].join(' ')}
				>
					<MediaBlock
						img={fireworksSvg}
						video={product.video}
						name={product.name}
						onBack={onBack}
					/>

					<div className='min-[681px]:flex-none min-[681px]:w-[200px] min-w-0 flex justify-end'>
						<SideInfoCard product={product} img={img} inStock={inStock} />
					</div>
				</div>

				{/* низ: GRID — 1fr (описание) + auto (Related) */}
				<div className='flex-1 min-h-0 grid grid-rows-[1fr_auto]'>
					<DescriptionBlock
						description={product.description}
						certificateNumber={product?.certificateNumber}
						className='min-h-0'
					/>

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
