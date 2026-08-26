import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PriceQtyButton from '@/components/cart/PriceQtyButton'
import ProductDetailReveal from '@/components/catalogue/ProductDetailReveal'
import ProductGrid from '@/components/catalogue/ProductGrid'
import {
	getCurrentPrice,
	getProductBySlug,
	getProducts,
	getRelatedProducts,
	hasValidDiscount,
} from '@/lib/catalogue'
import { formatDuration, formatPrice } from '@/lib/format'
import { slugify } from '@/lib/slugify'

export async function generateStaticParams() {
	const products = await getProducts()
	return products.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const product = await getProductBySlug(slug)
	if (!product) return {}

	const price = getCurrentPrice(product)
	const description = `${product.name} — ${product.manufacturer}. ${product.shots} залпов, калибр ${product.caliber}″. ${formatPrice(price)} ₽.`

	return {
		title: product.name,
		description,
		alternates: { canonical: `/product/${product.slug}` },
		openGraph: { title: product.name, description, type: 'website', url: `/product/${product.slug}` },
		twitter: { card: 'summary', title: product.name, description },
	}
}

function Param({ icon, children, title }: { icon: string; children: React.ReactNode; title?: string }) {
	return (
		<div className="flex items-center gap-1 text-[12px] text-[#6b6b6b]">
			<Image src={icon} alt="" width={21} height={21} className="shrink-0" />
			<span className="max-w-[44px] min-w-0 truncate font-medium text-[#4a4a4a]" title={title}>
				{children}
			</span>
		</div>
	)
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const product = await getProductBySlug(slug)
	if (!product) notFound()

	const [related, discounted, price] = await Promise.all([
		getRelatedProducts(product, 10),
		hasValidDiscount(product),
		getCurrentPrice(product),
	])

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.description,
		brand: { '@type': 'Brand', name: product.manufacturer },
		offers: {
			'@type': 'Offer',
			priceCurrency: 'RUB',
			price,
			availability:
				product.stock > 0
					? 'https://schema.org/InStock'
					: 'https://schema.org/OutOfStock',
		},
	}

	// The original's product detail view (ProductDetails.jsx) is a compound
	// composition, not one photo: a big decorative hero (MediaBlock, the
	// SAME fireworksSvg.svg on every product, not per-product art) sits
	// beside a self-contained SideInfoCard — its own small 200×200
	// object-contain product photo, name, manufacturer, a 2×2 icon+value
	// parameter grid (shots/caliber/duration/effects, in that exact order,
	// 21×21 icons), stock line, old price, and the qty+price CTA. Restored
	// 1:1 rather than the single-image/definition-list version this page
	// had before.
	return (
		<ProductDetailReveal>
			<div className="space-y-2.5 pt-[10px]">
				{/* JSON-LD we constructed above from typed fields, not user input */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>

				<nav className="font-baron px-1 text-xs lowercase text-[#9c9c9c]" aria-label="Хлебные крошки">
					<Link href="/" className="hover:text-firework-red">
						главная
					</Link>{' '}
					/{' '}
					<Link href={`/category/${slugify(product.category)}`} className="hover:text-firework-red">
						{product.category}
					</Link>
				</nav>

				<div className="flex flex-col gap-2.5 min-[681px]:flex-row min-[681px]:items-stretch min-[681px]:gap-[10px]">
					{/* MediaBlock: decorative hero, identical on every product */}
					<div className="relative h-[240px] min-w-0 flex-1 overflow-hidden rounded-[10px] bg-[#f6f4f2] min-[681px]:h-[400px]">
						<Image src="/SVG/fireworksSvg.svg" alt="" fill className="rounded-[12px] object-cover" />
						<div className="pointer-events-none absolute inset-0 grid place-items-center">
							<div className="grid place-items-center rounded-[10px] px-3 py-2 shadow-lg">
								<Image src="/SVG/overlay.svg" alt="" width={50} height={50} aria-hidden />
							</div>
						</div>
					</div>

					{/* SideInfoCard */}
					<aside className="flex w-full flex-shrink-0 items-start gap-[10px] min-[681px]:w-[200px] min-[681px]:flex-col">
						<div className="grid h-52 w-48 shrink-0 place-items-center rounded-[20px] bg-[#f6f4f2] min-[681px]:h-[200px] min-[681px]:w-full min-[681px]:rounded-[12px]">
							<Image
								src="/SVG/full-block.svg"
								alt={product.name}
								width={160}
								height={160}
								className="h-full w-full object-contain"
							/>
						</div>

						<div className="flex min-w-0 flex-1 flex-col items-start bg-white px-1.5 pt-2.5 min-[681px]:flex-none min-[681px]:pt-0">
							<h1
								className="font-baron w-full truncate text-[18px] leading-tight text-[#333] max-[1039px]:text-[14px] min-[681px]:w-[150px]"
								title={product.name}
							>
								{product.name}
							</h1>

							<div className="font-baron mt-[5px] text-[10px] text-[#625a51] uppercase">
								<span className="lowercase">производитель:</span> {product.manufacturer || '—'}
							</div>

							<div className="font-baron ml-1 mt-2.5 grid grid-cols-2 gap-x-2 gap-y-2 text-[12px]">
								<Param icon="/SVG/rocket.svg">{product.shots ?? '—'}</Param>
								<Param icon="/SVG/radius.svg">{product.caliber ?? '—'}</Param>
								<Param icon="/SVG/time.svg" title={formatDuration(product.durationSec)}>
									{formatDuration(product.durationSec)}
								</Param>
								<Param icon="/SVG/star.svg">{product.effectsCount ?? '—'}</Param>
							</div>

							<p
								className={`font-baron mt-[5px] ml-1 mb-[7px] text-[13px] leading-[13px] whitespace-nowrap lowercase ${discounted ? '' : 'mb-[26px]'} ${
									product.stock > 0 ? 'text-[#098D00]' : 'text-red-600'
								}`}
							>
								{product.stock > 0 ? (
									<>
										в наличии <span>{product.stock}</span> шт
									</>
								) : (
									'нет в наличии'
								)}
							</p>

							{discounted && (
								<div className="font-baron relative right-1.5 bottom-1.5 text-[14px] text-[#BD52E9] line-through decoration-1">
									{formatPrice(product.price)}
								</div>
							)}

							<div className="w-full min-[681px]:-ml-1.5 min-[681px]:w-[200px]">
								<PriceQtyButton productId={product.id} unitPrice={price} outOfStock={product.stock <= 0} />
							</div>
						</div>
					</aside>
				</div>

				<div className="rounded-[12px] bg-transparent p-2">
					<div className="scroll-hidden max-h-[120px] w-full overflow-y-auto">
						<div className="font-baron mb-1 text-[18px] font-semibold">Описание:</div>
						<p className="text-[16px] opacity-80">{product.description || 'Описание товара отсутствует.'}</p>
						<div className="font-baron mt-3 mb-1 text-[18px] font-semibold">Сертификат</div>
						<p className="text-[16px] opacity-80">
							{product.certificateNumber?.trim() || '—'}
						</p>
					</div>
				</div>

				{related.length > 0 && <ProductGrid title="добавь в набор" products={related} />}
			</div>
		</ProductDetailReveal>
	)
}
