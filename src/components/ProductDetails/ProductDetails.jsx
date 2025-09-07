// src/components/ProductDetails/ProductDetails.jsx
import { memo } from 'react'
import DescriptionBlock from './parts/DescriptionBlock'
import MediaBlock from './parts/MediaBlock'
import RelatedBlock from './parts/RelatedBlock'
import SideInfoCard from './parts/SideInfoCard'

const ProductDetails = ({
	product,
	related = [],
	onBack,
	onOpenSubcategory,
	onOpenProductDetail,
	onSelectProduct,
}) => {
	if (!product) return null

	const img = product.images?.[0]

	return (
		<section className='bg-white rounded-[20px] w-auto h-[834px] overflow-hidden flex flex-col'>
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* верх: медиа + правая колонка */}
				<div className='flex items-start gap-2.5'>
					<MediaBlock img={img} name={product.name} onBack={onBack} />
					<SideInfoCard product={product} img={img} />
				</div>

				{/* описание */}
				<DescriptionBlock description={product.description} />

				{/* добавь в набор */}
				<RelatedBlock
					related={related}
					currentCategory={product.category}
					onSelectProduct={onSelectProduct}
					onOpenSubcategory={onOpenSubcategory}
				/>
			</div>
		</section>
	)
}

export default memo(ProductDetails)
