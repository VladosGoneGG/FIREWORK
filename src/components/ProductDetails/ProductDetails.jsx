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
		<section className='bg-white rounded-[20px] w-full min-h-[834px] h-auto overflow-visible flex flex-col'>
			<div className='p-2.5 flex flex-col gap-[50px]  h-full'>
				{/* верх: медиа + правая колонка (фикс.секция без роста) */}
				<div className='flex items-start gap-2.5 flex-none'>
					<MediaBlock img={fireworksSvg} name={product.name} onBack={onBack} />
					<SideInfoCard product={product} img={img} inStock={inStock} />
				</div>

				{/* низ: описание + «добавь в набор» */}
				<div className='flex-1 min-h-0 flex flex-col'>
					{/* описание остаётся сверху/по центру, если нужно — оберни в контейнер и центрируй */}
					<DescriptionBlock description={product.description} />

					{/* прижимаем «добавь в набор» к нижнему краю */}
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
