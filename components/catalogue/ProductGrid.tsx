import type { Product } from '@/lib/catalogue'
import ProductCard from './ProductCard'
import ProductGridReveal from './ProductGridReveal'

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
			{/* Keyed by title *and* the actual product order/ids, not just
			    title: a sort change reorders the same section's products
			    without changing its title, and the entrance should still
			    replay for that — matching the original's animKey, which
			    includes sortKey precisely so this case remounts. */}
			<ProductGridReveal key={`${title ?? ''}-${products.map(p => p.id).join(',')}`}>
				{products.map(p => (
					<ProductCard key={p.id} product={p} />
				))}
			</ProductGridReveal>
		</section>
	)
}
