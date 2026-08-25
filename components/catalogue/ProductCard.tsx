import Link from 'next/link'
import AddToCartButton from '@/components/cart/AddToCartButton'
import { getCurrentPrice, hasValidDiscount, type Product } from '@/lib/catalogue'
import { formatDuration, formatPrice } from '@/lib/format'

// Server Component — AddToCartButton is the only client-side piece
// (cart state, localStorage); everything else here costs nothing on the
// client and stays server-rendered.
//
// Not one giant <Link> around the whole card: a <button> can't legally
// nest inside an <a>, and browsers/screen readers handle that combination
// inconsistently. The link covers the browsable part (image, name, specs);
// the cart button is a sibling, not a descendant.
export default function ProductCard({ product }: { product: Product }) {
	const discounted = hasValidDiscount(product)
	const currentPrice = getCurrentPrice(product)
	const outOfStock = product.stock <= 0

	return (
		<article className="group flex flex-col rounded-2xl bg-white p-3 shadow-[0_0_10px_0_rgba(0,0,0,0.08)] transition hover:shadow-[0_0_16px_0_rgba(0,0,0,0.14)]">
			<Link href={`/product/${product.slug}`} className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red">
				<div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f6f4f2] text-xs text-[#9c9c9c]">
					{outOfStock && (
						<span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
							нет в наличии
						</span>
					)}
					нет фото
				</div>

				<div className="mt-2 min-h-0">
					<p className="truncate text-xs uppercase tracking-wide text-[#9c9c9c]">
						{product.manufacturer}
					</p>
					<h3 className="font-baron truncate text-sm leading-tight text-[#333]">
						{product.name}
					</h3>
				</div>

				<dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-[#625a51]">
					<dt className="opacity-70">залпов</dt>
					<dd className="font-medium">{product.shots}</dd>
					<dt className="opacity-70">калибр</dt>
					<dd className="font-medium">{product.caliber}″</dd>
					<dt className="opacity-70">длительность</dt>
					<dd className="font-medium">{formatDuration(product.durationSec)}</dd>
				</dl>
			</Link>

			<div className="mt-3 flex items-end justify-between gap-2">
				{discounted ? (
					<div>
						<div className="text-xs text-[#bd52e9] line-through">
							{formatPrice(product.price)} ₽
						</div>
						<div className="font-baron text-base font-semibold text-[#333]">
							{formatPrice(currentPrice)} ₽
						</div>
					</div>
				) : (
					<div className="font-baron text-base font-semibold text-[#333]">
						{formatPrice(currentPrice)} ₽
					</div>
				)}
				<AddToCartButton productId={product.id} outOfStock={outOfStock} className="h-11 shrink-0 px-3" />
			</div>
		</article>
	)
}
