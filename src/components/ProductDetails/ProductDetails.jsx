// src/components/ProductDetails/ProductDetails.jsx
import { memo } from 'react'
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

	return (
		<section className='bg-white rounded-[20px] w-full min-h-[834px] h-auto overflow-visible flex flex-col max-[1040px]:mt-16'>
			{/* ⬇️ было h-full — из-за этого mt-auto снизу не срабатывал */}
			<div className='p-2.5 flex flex-col justify-between min-h-[834px]'>
				{/* верх: медиа + правая колонка */}
				<div className='flex flex-col min-[681px]:flex-row gap-2.5 flex-none min-[681px]:items-stretch'>
					<MediaBlock img={fireworksSvg} name={product.name} onBack={onBack} />
					<SideInfoCard product={product} img={img} inStock={inStock} />
				</div>

				{/* низ: описание + «добавь в набор» */}
				<div className='flex-1 min-h-0 flex flex-col'>
					<DescriptionBlock description={product.description} />

					<div className='mt-auto w-full flex flex-col justify-end'>
						<RelatedBlock
							related={related}
							currentCategory={product.category}
							onSelectProduct={onSelectProduct}
							onOpenSubcategory={payload => {
								onOpenSubcategory?.(payload)
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

export default memo(ProductDetails)
