// src/components/LayoutMobile/parts/SectionMobile.jsx
import { useEffect, useMemo, useState } from 'react'
import ProductCardMiniMobile from './ProductCardMiniMobile'

const INITIAL = 6
const STEP = 6

const SectionMobile = ({
	title,
	products = [],
	onSelectProduct,
	onOpenSubcategory,
	loading = false,
	showHeader = true,
	uncapped = false,
}) => {
	const [visibleCount, setVisibleCount] = useState(INITIAL)

	useEffect(() => {
		setVisibleCount(uncapped ? products.length || 0 : Math.min(INITIAL, products.length || 0))
	}, [products, uncapped])

	const visible = useMemo(
		() => products.slice(0, visibleCount),
		[products, visibleCount]
	)

	const handleOpenMore = () => {
		if (onOpenSubcategory) {
			onOpenSubcategory({ title, products })
		} else {
			setVisibleCount(c => Math.min(c + STEP, products.length))
		}
	}

	// показываем кнопку ТОЛЬКО если есть невлезшие карточки
	const hasMore = !loading && products.length > visibleCount

	// до md всегда узко; на md+ для 2 карт — 730px, для 3+ — без ограничений
	const wrapW =
		visible.length >= 3
			? ' w-full '
			: visible.length === 2
			? 'w-full'
			: 'w-full'

	return (
		<section className='space-y-3 '>
			<div className={wrapW}>
				{showHeader && (
					<div className='flex items-center justify-between mb-2.5'>
						<h3 className='text-[18px] lowercase font-baron '>{title}</h3>

						{hasMore && (
							<button
								type='button'
								onClick={handleOpenMore}
								className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer pr-[6px]'
							>
								посмотреть ещё
							</button>
						)}
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] justify-items-center md:justify-items-center'>
					{loading ? (
						Array.from({ length: INITIAL }).map((_, i) => (
							<div key={i} className='w-full'>
								<div className='h-[100px] rounded-[20px] bg-zinc-200/60 animate-pulse' />
							</div>
						))
					) : (
						visible.map(p => (
							<div key={p.id || p.sku || p.name} className='w-full'>
								<ProductCardMiniMobile
									product={p}
									onSelect={onSelectProduct}
								/>
							</div>
						))
					)}
				</div>
			</div>
		</section>
	)
}

export default SectionMobile
