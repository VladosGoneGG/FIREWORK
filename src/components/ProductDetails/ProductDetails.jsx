// src/components/ProductDetails/ProductDetails.jsx
import { memo } from 'react'
import fireworksSvg from '../../assets/SVG/fireworksSvg.svg'
import DescriptionBlock from './parts/DescriptionBlock'
import MediaBlock from './parts/MediaBlock'
import RelatedBlock from './parts/RelatedBlock'
import SideInfoCard from './parts/SideInfoCard'

/**
 * Props:
 * - product: Product
 * - related: Product[]
 * - onBack: () => void
 * - onOpenSubcategory: (payload) => void
 * - onSelectProduct?: (product)=>void
 */
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
		// фиксированный размер карточки, без внутреннего скролла
		<section className='bg-white rounded-[20px] w-[925px] h-[834px] overflow-hidden flex flex-col'>
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* верх: медиа + правая колонка (фикс.секция без роста) */}
				<div className='flex items-start gap-2.5 flex-none'>
					<MediaBlock img={fireworksSvg} name={product.name} onBack={onBack} />
					<SideInfoCard product={product} img={img} inStock={inStock} />
				</div>

				{/* низ: описание + «добавь в набор»; без прокрутки, как в исходной задумке */}
				<div className='flex-1 min-h-0'>
					<DescriptionBlock description={product.description} />

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
		</section>
	)
}

export default memo(ProductDetails)
