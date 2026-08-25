import Link from 'next/link'
import { getCurrentPrice, hasValidDiscount, type Product } from '@/lib/catalogue'
import { formatDuration, formatPrice } from '@/lib/format'

// Server Component — no interactivity here on purpose. Adding to cart is a
// client-only concern (state, localStorage) landing in P5; this card stays
// server-rendered so it costs nothing on the client until that button is
// added as its own small island.
export default function ProductCard({ product }: { product: Product }) {
	const discounted = hasValidDiscount(product)
	const currentPrice = getCurrentPrice(product)
	const outOfStock = product.stock <= 0

	return (
		<Link
			href={`/product/${product.slug}`}
			className="group flex flex-col rounded-2xl bg-white p-3 shadow-[0_0_10px_0_rgba(0,0,0,0.08)] transition hover:shadow-[0_0_16px_0_rgba(0,0,0,0.14)]"
		>
			<div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f6f4f2] text-xs text-[#9c9c9c]">
				{outOfStock && (
					<span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
						нет в наличии
					</span>
				)}
				нет фото
			</div>

			<div className="mt-2 min-h-0">
				<p className="truncate text-[10px] uppercase tracking-wide text-[#9c9c9c]">
					{product.manufacturer}
				</p>
				<h3 className="font-baron truncate text-sm leading-tight text-[#333]">
					{product.name}
				</h3>
			</div>

			<dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#625a51]">
				<dt className="opacity-70">залпов</dt>
				<dd className="font-medium">{product.shots}</dd>
				<dt className="opacity-70">калибр</dt>
				<dd className="font-medium">{product.caliber}″</dd>
				<dt className="opacity-70">длительность</dt>
				<dd className="font-medium">{formatDuration(product.durationSec)}</dd>
			</dl>

			<div className="mt-3 flex items-end justify-between">
				{discounted ? (
					<div>
						<div className="text-[11px] text-[#bd52e9] line-through">
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
			</div>
		</Link>
	)
}
