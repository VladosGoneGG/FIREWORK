import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FilterToggleButton from '@/components/catalogue/FilterToggleButton'
import ProductGrid from '@/components/catalogue/ProductGrid'
import SortDropdown from '@/components/catalogue/SortDropdown'
import { getCategories, getCategoryBySlug, getProducts } from '@/lib/catalogue'
import { applyFilters, type Filters, type PowerBucket } from '@/lib/filters'
import { applySort, type SortKey } from '@/lib/sort'

const isSortKey = (v: unknown): v is SortKey => v === 'price-asc' || v === 'price-desc'

export async function generateStaticParams() {
	const categories = await getCategories()
	return categories.filter(c => c.slug !== 'all').map(c => ({ slug: c.slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const category = await getCategoryBySlug(slug)
	if (!category) return {}
	const description = `${category.name} — купить с доставкой по Нижнему Новгороду. Сертифицированная пиротехника.`
	return {
		title: category.name,
		description,
		alternates: { canonical: `/category/${category.slug}` },
		openGraph: { title: category.name, description, type: 'website', url: `/category/${category.slug}` },
		twitter: { card: 'summary', title: category.name, description },
	}
}

export default async function CategoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | undefined>>
}) {
	const { slug } = await params
	const sp = await searchParams
	const category = await getCategoryBySlug(slug)
	if (!category) notFound()

	const sort: SortKey = isSortKey(sp.sort) ? sp.sort : 'price-asc'
	const activeSub = sp.sub

	const allProducts = await getProducts()
	const inCategory = applyFilters(allProducts, {
		category: activeSub || category.name,
	})

	const list = (key: string) => (sp[key] ? sp[key]!.split(',').filter(Boolean) : [])
	const num = (key: string) => (sp[key] ? Number(sp[key]) : undefined)
	const facetFilters: Filters = {
		manufacturers: list('manufacturer'),
		shots: list('shots').map(Number),
		power: list('power') as PowerBucket[],
		ignitionType: list('ignition'),
		view: list('view'),
		size: list('size'),
		tags: list('tags'),
		price: { min: num('priceMin'), max: num('priceMax') },
		duration: { min: num('durationMin'), max: num('durationMax') },
	}
	const filtered = applyFilters(inCategory, facetFilters)
	const products = applySort(filtered, sort)

	return (
		<div className="space-y-4 pt-[10px]">
			<div className="flex items-start justify-between gap-2 pl-1">
				<h1 className="font-baron text-lg leading-none text-[#333] lowercase">
					{activeSub || category.name} <span className="text-[#9c9c9c]">· {products.length}</span>
				</h1>
				<div className="ml-auto flex items-end gap-2">
					<FilterToggleButton />
					{products.length > 0 && (
						<SortDropdown basePath={`/category/${category.slug}`} searchParams={sp} value={sort} />
					)}
				</div>
			</div>
			{products.length > 0 ? (
				<ProductGrid products={products} />
			) : (
				<div className="rounded-2xl bg-white p-8 text-center">
					<p className="font-baron text-sm text-[#625a51]">товары не найдены</p>
					{activeSub && (
						<Link
							href={`/category/${category.slug}`}
							className="font-baron text-firework-red mt-3 inline-block text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
						>
							смотреть все «{category.name}»
						</Link>
					)}
				</div>
			)}
		</div>
	)
}
