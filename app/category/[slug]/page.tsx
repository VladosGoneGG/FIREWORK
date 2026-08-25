import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CategoryNav from '@/components/catalogue/CategoryNav'
import ProductGrid from '@/components/catalogue/ProductGrid'
import SortLinks from '@/components/catalogue/SortLinks'
import { getCategories, getCategoryBySlug, getProducts } from '@/lib/catalogue'
import { applyFilters } from '@/lib/filters'
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

	const [allProducts, categories] = await Promise.all([getProducts(), getCategories()])
	const inCategory = applyFilters(allProducts, {
		category: activeSub || category.name,
	})
	const products = applySort(inCategory, sort)

	return (
		<div className="grid grid-cols-1 gap-5 md:grid-cols-[240px_1fr]">
			<div className="space-y-3 md:sticky md:top-5 md:self-start">
				<CategoryNav categories={categories} activeSlug={category.slug} />
				{category.subcategories.length > 0 && (
					<nav
						aria-label="Подкатегории"
						className="rounded-2xl bg-white p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]"
					>
						<ul className="font-baron space-y-0.5 text-sm lowercase">
							<li>
								<Link
									href={`/category/${category.slug}`}
									className={`flex min-h-11 items-center rounded-xl px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red ${
										!activeSub ? 'font-medium text-firework-red' : 'text-[#625a51] hover:text-firework-red'
									}`}
								>
									все {category.name}
								</Link>
							</li>
							{category.subcategories.map(sub => (
								<li key={sub.id}>
									<Link
										href={`/category/${category.slug}?sub=${encodeURIComponent(sub.name)}`}
										className={`flex min-h-11 items-center rounded-xl px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red ${
											activeSub === sub.name
												? 'font-medium text-firework-red'
												: 'text-[#625a51] hover:text-firework-red'
										}`}
									>
										{sub.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				)}
			</div>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="font-baron text-lg lowercase text-[#333]">
						{activeSub || category.name} <span className="text-[#9c9c9c]">· {products.length}</span>
					</h1>
					{products.length > 0 && (
						<SortLinks basePath={`/category/${category.slug}`} searchParams={sp} value={sort} />
					)}
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
		</div>
	)
}
