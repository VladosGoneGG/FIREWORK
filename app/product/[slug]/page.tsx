import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/cart/AddToCartButton'
import ProductGrid from '@/components/catalogue/ProductGrid'
import {
	getCurrentPrice,
	getProductBySlug,
	getProducts,
	getRelatedProducts,
	hasValidDiscount,
} from '@/lib/catalogue'
import { formatDuration, formatPrice } from '@/lib/format'
import { powerBucket } from '@/lib/filters'
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
		openGraph: { title: product.name, description, type: 'website' },
	}
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

	return (
		<div className="space-y-8">
			{/* JSON-LD we constructed above from typed fields, not user input */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<nav className="font-baron text-[11px] lowercase text-[#9c9c9c]" aria-label="Хлебные крошки">
				<Link href="/" className="hover:text-firework-red">
					главная
				</Link>{' '}
				/{' '}
				<Link href={`/category/${slugify(product.category)}`} className="hover:text-firework-red">
					{product.category}
				</Link>
			</nav>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
				<div className="flex aspect-video items-center justify-center rounded-2xl bg-[#f6f4f2] text-sm text-[#9c9c9c]">
					нет фото
				</div>

				<div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
					<p className="text-[11px] uppercase tracking-wide text-[#9c9c9c]">
						{product.manufacturer}
					</p>
					<h1 className="font-baron text-xl leading-tight text-[#333]">{product.name}</h1>

					{discounted ? (
						<div>
							<div className="text-sm text-[#bd52e9] line-through">
								{formatPrice(product.price)} ₽
							</div>
							<div className="font-baron text-2xl font-semibold text-[#333]">
								{formatPrice(price)} ₽
							</div>
						</div>
					) : (
						<div className="font-baron text-2xl font-semibold text-[#333]">
							{formatPrice(price)} ₽
						</div>
					)}

					<dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-[#625a51]">
						<dt className="opacity-70">залпов</dt>
						<dd className="font-medium">{product.shots}</dd>
						<dt className="opacity-70">калибр</dt>
						<dd className="font-medium">{product.caliber}″</dd>
						<dt className="opacity-70">длительность</dt>
						<dd className="font-medium">{formatDuration(product.durationSec)}</dd>
						<dt className="opacity-70">эффектов</dt>
						<dd className="font-medium">{product.effectsCount}</dd>
						<dt className="opacity-70">мощность</dt>
						<dd className="font-medium">{powerBucket(product)}</dd>
						<dt className="opacity-70">воспламенение</dt>
						<dd className="font-medium">{product.ignitionType}</dd>
					</dl>

					<p
						className={`text-[11px] ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}
					>
						{product.stock > 0 ? `в наличии ${product.stock} шт` : 'нет в наличии'}
					</p>

					{product.certificateNumber && (
						<p className="text-[10px] text-[#9c9c9c]">
							сертификат: {product.certificateNumber}
						</p>
					)}

					<AddToCartButton
						productId={product.id}
						outOfStock={product.stock <= 0}
						className="h-11 w-full"
					/>
				</div>
			</div>

			<section className="space-y-2 rounded-2xl bg-white p-4 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
				<h2 className="font-baron text-sm font-semibold text-[#333]">описание</h2>
				<p className="text-sm text-[#625a51]">{product.description}</p>
			</section>

			{related.length > 0 && <ProductGrid title="добавь в набор" products={related} />}
		</div>
	)
}
