import { memo } from 'react'
import fireworksSvg from '../../assets/SVG/fireworksSvg.svg'
import DescriptionBlock from './parts/DescriptionBlock'
import MediaBlock from './parts/MediaBlock'
import RelatedBlock from './parts/RelatedBlock'
import SideInfoCard from './parts/SideInfoCard'

/**
 * Props:
 * - product: Product
 * - related: Product[]                // полный список «похожих» (из ProductsPage)
 * - onBack: () => void
 * - onOpenSubcategory: (payload) => void
 * - onSelectProduct?: (product)=>void // открыть другой товар по клику снизу
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
		<section className='bg-white rounded-[20px] w-[925px] h-[834px] overflow-hidden flex flex-col'>
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* верх: медиа + правая колонка */}
				<div className='flex items-start gap-2.5'>
					<MediaBlock img={fireworksSvg} name={product.name} onBack={onBack} />

					<SideInfoCard product={product} img={img} inStock={inStock} />
				</div>

				{/* описание */}
				<DescriptionBlock description={product.description} />

				{/* добавь в набор */}
				<RelatedBlock
					related={related}
					currentCategory={product.category}
					onSelectProduct={onSelectProduct}
					onOpenSubcategory={payload => {
						// В payload уже есть готовые products
						onOpenSubcategory?.(payload)
					}}
				/>
			</div>
		</section>
	)
}

export default memo(ProductDetails)
