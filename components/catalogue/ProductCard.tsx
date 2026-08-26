import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/cart/AddToCartButton'
import { getCurrentPrice, hasValidDiscount, type Product } from '@/lib/catalogue'
import { formatDuration, formatPrice } from '@/lib/format'

function Param({
	icon,
	title,
	children,
}: {
	icon: string
	title?: string
	children: React.ReactNode
}) {
	return (
		<div className="flex items-center gap-[7px]" title={title}>
			<Image src={icon} alt="" width={21} height={21} aria-hidden />
			<span>{children}</span>
		</div>
	)
}

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
		<article className="font-baron h-[233px] w-full shrink-0 flex-[1_0_121px] max-w-[150px] rounded-[10px] bg-[#F2F2F2] p-[5px] transition-[background-color,box-shadow,transform] duration-300 ease-in-out hover:-translate-y-[1px] hover:bg-[#efebe6] hover:shadow-[0_0px_5px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-[#bd52e9]">
			<div className="flex h-full w-full flex-col">
				<Link
					href={`/product/${product.slug}`}
					className="flex flex-1 flex-col focus-visible:outline-none"
				>
					<div className="relative h-[111px] w-full overflow-hidden rounded-[5px] bg-white shadow-[0_0_5px_0_rgba(0,0,0,0.15)]">
						<Image
							src="/SVG/full-block.svg"
							alt=""
							fill
							className="object-cover"
						/>
						{outOfStock && (
							<span className="absolute left-1 top-1 rounded-[6px] bg-black/60 px-1.5 py-[1px] text-[9px] text-white">
								Нет в наличии
							</span>
						)}
					</div>

					<div className="pt-[5px] text-left">
						<h3 className="font-barlow line-clamp-1 break-words text-[13px] font-semibold leading-tight text-[#333]">
							{product.name}
						</h3>
						<div className="text-[8px] font-bold lowercase text-[#625a51]">
							{product.manufacturer || '—'}
						</div>
					</div>

					<div className="flex justify-center gap-2.5 text-[12px] leading-none text-[#625A51]">
						<div className="flex h-[25px] w-[65px] flex-col gap-0.5 whitespace-nowrap">
							<Param icon="/SVG/rocket.svg">{product.shots ?? '—'}</Param>
							<Param icon="/SVG/time.svg" title={formatDuration(product.durationSec)}>
								{formatDuration(product.durationSec)}
							</Param>
						</div>
						<div className="flex h-[25px] w-[50px] flex-col whitespace-nowrap">
							<Param icon="/SVG/radius.svg">{product.caliber ?? '—'}</Param>
							<Param icon="/SVG/star.svg">{product.effectsCount ?? '—'}</Param>
						</div>
					</div>
				</Link>

				<div className="mt-auto flex items-end justify-between">
					{discounted ? (
						<div className="ml-1 pt-2">
							<div className="relative bottom-2.5 h-[2.5px] text-[12px] font-bold lowercase text-[#BD52E9] line-through">
								{formatPrice(product.price)}
							</div>
							<div className="text-[15px] font-bold text-[#333]">
								{formatPrice(currentPrice)}
								<span className="font-baron relative top-0.5 left-[1px] text-[8px] lowercase">
									руб.
								</span>
							</div>
						</div>
					) : (
						<div className="ml-1 pb-[3px] pt-2 text-[15px] font-bold text-[#333]">
							{formatPrice(currentPrice)}
							<span className="font-baron relative top-0.5 text-[8px] lowercase">руб.</span>
						</div>
					)}
					<AddToCartButton productId={product.id} outOfStock={outOfStock} />
				</div>
			</div>
		</article>
	)
}
