import type { Metadata } from 'next'
import CategoryNav from '@/components/catalogue/CategoryNav'
import ProductGrid from '@/components/catalogue/ProductGrid'
import SearchForm from '@/components/catalogue/SearchForm'
import SortLinks from '@/components/catalogue/SortLinks'
import { getCategories, getProducts } from '@/lib/catalogue'
import { applyFilters, filterDiscounted } from '@/lib/filters'
import { applySort, type SortKey } from '@/lib/sort'

// No title here: the layout's default already reads exactly right for
// the home page, and setting an identical one would get suffixed by the
// title template ("... — Салюты — Салюты").
export const metadata: Metadata = {
	description:
		'Салюты, фонтаны, петарды, вертушки, ракеты и фейерверки в Нижнем Новгороде. Сертифицированная продукция.',
}

const isSortKey = (v: unknown): v is SortKey => v === 'price-asc' || v === 'price-desc'

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | undefined>>
}) {
	const params = await searchParams
	const query = params.q?.trim() ?? ''
	const sort: SortKey = isSortKey(params.sort) ? params.sort : 'price-asc'

	const [allProducts, categories] = await Promise.all([getProducts(), getCategories()])

	if (query) {
		const results = applySort(applyFilters(allProducts, { search: query }), sort)
		return (
			<div className="grid grid-cols-1 gap-5 md:grid-cols-[240px_1fr]">
				<div className="md:sticky md:top-5 md:self-start">
					<CategoryNav categories={categories} />
				</div>
				<div className="space-y-4">
					<SearchForm defaultValue={query} />
					<div className="flex items-center justify-between">
						<h1 className="font-baron text-lg lowercase text-[#333]">
							найдено {results.length}
						</h1>
						<SortLinks basePath="/" searchParams={params} value={sort} />
					</div>
					<ProductGrid products={results} />
				</div>
			</div>
		)
	}

	const discounted = applySort(filterDiscounted(allProducts), sort)
	const discountedIds = new Set(discounted.map(p => p.id))
	const rest = allProducts.filter(p => !discountedIds.has(p.id))

	const byCategory = new Map<string, typeof rest>()
	for (const p of rest) {
		const key = p.category
		if (!byCategory.has(key)) byCategory.set(key, [])
		byCategory.get(key)!.push(p)
	}

	return (
		<div className="grid grid-cols-1 gap-5 md:grid-cols-[240px_1fr]">
			<div className="md:sticky md:top-5 md:self-start">
				<CategoryNav categories={categories} />
			</div>
			<div className="space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<SearchForm />
					<SortLinks basePath="/" searchParams={params} value={sort} />
				</div>
				{discounted.length > 0 && <ProductGrid title="акции" products={discounted} />}
				{[...byCategory.entries()].map(([category, items]) => (
					<ProductGrid key={category} title={category} products={applySort(items, sort)} />
				))}
			</div>
		</div>
	)
}
