import { getCurrentPrice, type Product } from './catalogue'

export type SortKey = 'price-asc' | 'price-desc'

export function applySort(products: Product[], sortKey: SortKey = 'price-asc'): Product[] {
	const sorted = [...products]
	sorted.sort((a, b) => {
		const diff = getCurrentPrice(a) - getCurrentPrice(b)
		return sortKey === 'price-desc' ? -diff : diff
	})
	return sorted
}
