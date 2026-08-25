// Catalogue data-access boundary. Every component/route reads the
// catalogue through these functions — never by importing content/products
// or content/categories directly. Today they're backed by the
// deterministic fixture; swapping in a real 1C-backed source later means
// changing the bodies below, not any call site.
//
// Deliberately plain async functions, not a repository class or interface
// hierarchy: there is exactly one implementation today, and a second
// implementation is not being written yet (see the migration plan, P3 —
// don't build the 1C adapter before there's a contract to build it
// against).

import { categories as categoriesFixture, type Category } from '@/content/categories'
import { products as productsFixture, type Product } from '@/content/products'

export type { Category, Subcategory } from '@/content/categories'
export type { Product } from '@/content/products'

export async function getProducts(): Promise<Product[]> {
	return productsFixture
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
	return productsFixture.find(p => p.slug === slug) ?? null
}

export async function getProductById(id: number): Promise<Product | null> {
	return productsFixture.find(p => p.id === id) ?? null
}

export async function getCategories(): Promise<Category[]> {
	return categoriesFixture
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
	return categoriesFixture.find(c => c.slug === slug) ?? null
}

export async function getRelatedProducts(product: Product, limit = 10): Promise<Product[]> {
	return productsFixture
		.filter(p => p.category === product.category && p.id !== product.id)
		.slice(0, limit)
}

/**
 * The one place "current price" is decided: discount price wins whenever
 * it's a valid discount (positive and below the base price), otherwise the
 * base price. Every screen that displays or filters by price goes through
 * this — see the audit's "price precedence" business rule.
 */
export function getCurrentPrice(product: Pick<Product, 'price' | 'discountPrice'>): number {
	const { price, discountPrice } = product
	if (typeof discountPrice === 'number' && discountPrice > 0 && discountPrice < price) {
		return discountPrice
	}
	return price
}

export function hasValidDiscount(product: Pick<Product, 'price' | 'discountPrice'>): boolean {
	return (
		typeof product.discountPrice === 'number' &&
		product.discountPrice > 0 &&
		product.discountPrice < product.price
	)
}
