import type { Product } from '@/lib/catalogue'
import ProductCard from './ProductCard'

export default function ProductGrid({
	title,
	products,
}: {
	title?: string
	products: Product[]
}) {
	if (!products.length) return null

	return (
		<section className="space-y-3">
			{title && (
				<h2 className="font-baron text-lg lowercase leading-none text-[#333]">
					{title}
				</h2>
			)}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{products.map(p => (
					<ProductCard key={p.id} product={p} />
				))}
			</div>
		</section>
	)
}
