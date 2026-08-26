'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import CartAside from '@/components/cart/CartAside'
import CategoryNav from '@/components/catalogue/CategoryNav'
import CatalogueSidebarSlot from '@/components/catalogue/CatalogueSidebarSlot'
import FilterPanel from '@/components/catalogue/filters/FilterPanel'
import { FiltersOpenProvider } from '@/components/catalogue/FiltersOpenContext'
import type { Category, Product } from '@/lib/catalogue'
import { applyFilters } from '@/lib/filters'
import PageTransition from './PageTransition'

/**
 * The original's App.jsx three-column desktop grid — App.jsx itself never
 * unmounts (it's a plain SPA with no routing), so its sidebar
 * (CategoryFilter/PromoPanel/SubcategoryOverlay) and cart (ProductCart) are
 * just persistent siblings of ProductsPage, entirely outside ProductsPage's
 * own AnimatePresence. Reproduced here as a persistent Client Component
 * rendered once from app/layout.tsx — Next's closest equivalent of "never
 * unmounts across navigation" — instead of being rebuilt fresh inside each
 * page as before: a per-page shell made an exit-capable AnimatePresence for
 * the center content impossible, since page.tsx output is torn down
 * instantly on route change, giving a nested AnimatePresence no chance to
 * play an exit animation. Sidebar/cart are PageTransition's non-animated
 * siblings here, exactly mirroring App.jsx — they still re-render when
 * `pathname` changes (React re-renders this whole component), but carry no
 * animation of their own, so they stay visually static, same as their
 * previous "silent remount" per-page, just now structurally guaranteed by
 * being outside the crossfade rather than merely uninvolved by coincidence.
 *
 * `activeSlug` is parsed directly from `pathname` — safe unconditionally,
 * since this component itself is mounted for every route. `activeSub`
 * needs the `?sub=` query string; `useSearchParams()` is isolated inside
 * `Sidebar` below rather than called here, because `Sidebar` only ever
 * mounts on `/` and `/category/*` — both already dynamically rendered
 * (they read `searchParams` server-side for unrelated reasons) — so this
 * never touches the statically-generated `/product/[slug]` or `/contacts`
 * `/wholesale` routes. Suspense-wrapped anyway, matching Next's documented
 * requirement for useSearchParams().
 *
 * On the product-detail route (no sidebar) the grid widens instead of
 * showing an empty column, same as before. `/contacts` and `/wholesale`
 * get no shell at all — they render their own bare, centered content, also
 * unchanged from before this pass.
 *
 * Height/scroll model, preserved exactly: the root layout's `flex-1
 * min-h-0` wrapper hands this shell "remaining viewport height below the
 * header"; `min-h-0` plus `items-stretch` here does max(834px floor,
 * available) — every column stretches to that height, and the card's own
 * inner div is where `overflow-y-auto`/`scroll-hidden` live.
 */
export default function CatalogueShell({
	categories,
	allProducts,
	children,
}: {
	categories: Category[]
	allProducts: Product[]
	children: React.ReactNode
}) {
	const pathname = usePathname()

	const categoryMatch = pathname.match(/^\/category\/([^/?]+)/)
	const activeSlug = categoryMatch?.[1]
	const isProductRoute = pathname.startsWith('/product/')
	const isCatalogueRoute = pathname === '/' || !!activeSlug || isProductRoute

	if (!isCatalogueRoute) return <>{children}</>

	const sidebar = !isProductRoute && (
		<Suspense
			fallback={
				<CatalogueSidebarSlot
					categoryNav={<CategoryNav categories={categories} activeSlug={activeSlug} />}
					filterPanel={<FilterPanel products={allProducts} />}
				/>
			}
		>
			<Sidebar categories={categories} allProducts={allProducts} activeSlug={activeSlug} />
		</Suspense>
	)

	const gridCols = sidebar
		? 'min-[1041px]:[grid-template-columns:240px_minmax(449px,665px)_295px]'
		: 'min-[1041px]:[grid-template-columns:minmax(709px,925px)_295px]'

	return (
		<FiltersOpenProvider>
			<div className="flex h-full min-h-0 flex-col px-2.5 py-5">
				<div
					className={`mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 items-start gap-5 min-[1041px]:min-h-[834px] min-[1041px]:grid-rows-[minmax(0,1fr)] min-[1041px]:items-stretch ${gridCols}`}
				>
					{sidebar && <div className="self-start min-[1041px]:sticky min-[1041px]:top-5">{sidebar}</div>}
					<div className="relative flex min-w-0 min-h-0 flex-col min-[1041px]:overflow-hidden min-[1041px]:rounded-[20px] min-[1041px]:bg-white min-[1041px]:shadow-[0_0_10px_0_rgba(0,0,0,0.2)]">
						<div className="scroll-hidden min-[1041px]:min-h-0 min-[1041px]:flex-1 min-[1041px]:overflow-y-auto min-[1041px]:rounded-[20px] min-[1041px]:px-4 min-[1041px]:pb-2.5">
							<PageTransition>{children}</PageTransition>
						</div>
					</div>
					<CartAside />
				</div>
			</div>
		</FiltersOpenProvider>
	)
}

function Sidebar({
	categories,
	allProducts,
	activeSlug,
}: {
	categories: Category[]
	allProducts: Product[]
	activeSlug?: string
}) {
	const activeSub = useSearchParams().get('sub') ?? undefined
	const activeCategory = categories.find(c => c.slug === activeSlug)
	const productsForSidebar = activeCategory
		? applyFilters(allProducts, { category: activeSub || activeCategory.name })
		: allProducts

	return (
		<CatalogueSidebarSlot
			categoryNav={<CategoryNav categories={categories} activeSlug={activeSlug} activeSub={activeSub} />}
			filterPanel={<FilterPanel products={productsForSidebar} />}
		/>
	)
}
