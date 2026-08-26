'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Category } from '@/lib/catalogue'
import CategoryIcon from '@/components/home/CategoryIcon'

/**
 * The desktop category sidebar's accordion — ported from CategoryFilter.jsx
 * exactly: ONE expandedId for the whole list (not independent per-row
 * accordions), subcategories nest inline under their parent (pl-9 indent),
 * no separate "Подкатегории" panel, no chevron icon, no open/close
 * animation on the sub-list (the original mounts/unmounts it instantly).
 */
export default function CategoryNav({
	categories,
	activeSlug,
	activeSub,
}: {
	categories: Category[]
	activeSlug?: string
	activeSub?: string
}) {
	const activeCategory = categories.find(c => c.slug === activeSlug)
	const initialExpanded = activeSub
		? (activeCategory?.subcategories.some(s => s.name === activeSub) ? activeCategory.id : null)
		: (activeSlug ? (activeCategory?.subcategories.length ? activeCategory.id : null) : null)

	// Re-derives expandedId whenever the active route's category/subcategory
	// changes — mirrors CategoryFilter.jsx's own effect syncing expandedId
	// from selectedSub/selectedCategory. Adjusted during render (React's
	// documented "storing information from previous renders" pattern)
	// rather than in a useEffect, since this is deriving state from props,
	// not synchronizing with an external system.
	const [state, setState] = useState({
		expandedId: initialExpanded ?? null,
		prevActiveSlug: activeSlug,
		prevActiveSub: activeSub,
	})
	if (state.prevActiveSlug !== activeSlug || state.prevActiveSub !== activeSub) {
		setState({ expandedId: initialExpanded ?? null, prevActiveSlug: activeSlug, prevActiveSub: activeSub })
	}
	const expandedId = state.expandedId
	const setExpandedId = (updater: (prev: number | null) => number | null) =>
		setState(prev => ({ ...prev, expandedId: updater(prev.expandedId) }))

	return (
		<nav
			aria-label="Категории"
			className="font-baron w-[240px] rounded-[20px] bg-white p-2.5 font-bold shadow-[0_0_10px_0_rgba(0,0,0,0.2)] lowercase"
		>
			<ul className="space-y-1">
				<li>
					<Link
						href="/"
						className={`flex h-[30px] w-[230px] items-center gap-4 rounded-[12px] text-[12px] transition-transform duration-150 ease-out active:scale-[0.98] ${
							!activeSlug ? 'font-medium text-firework-red' : 'text-[#333] hover:text-firework-red'
						}`}
					>
						<CategoryIcon categoryId={0} active={!activeSlug} />
						все
					</Link>
				</li>
				{categories
					.filter(c => c.slug !== 'all')
					.map(cat => {
						const isActiveCat = activeSlug === cat.slug && !activeSub
						const isActiveViaSub = activeSlug === cat.slug && !!activeSub
						const isOpen = expandedId === cat.id && cat.subcategories.length > 0

						return (
							<li key={cat.id}>
								<Link
									href={`/category/${cat.slug}`}
									onClick={() => {
										if (cat.subcategories.length > 0) {
											setExpandedId(prev => (prev === cat.id ? null : cat.id))
										} else {
											setExpandedId(() => null)
										}
									}}
									className={`flex h-[30px] w-[230px] items-center gap-4 rounded-[12px] text-[12px] transition-transform duration-150 ease-out active:scale-[0.98] ${
										isActiveCat || isActiveViaSub
											? 'font-medium text-firework-red'
											: 'text-[#333] hover:text-firework-red'
									}`}
								>
									<CategoryIcon categoryId={cat.id} active={isActiveCat || isActiveViaSub} />
									{cat.name}
								</Link>
								{isOpen && (
									<ul className="mt-1 space-y-1 pl-9">
										{cat.subcategories.map(sub => {
											const isActiveSub = activeSlug === cat.slug && activeSub === sub.name
											return (
												<li key={sub.id}>
													<Link
														href={`/category/${cat.slug}?sub=${encodeURIComponent(sub.name)}`}
														className={`flex h-[30px] w-[190px] items-center rounded-[8px] px-2 text-left text-[12px] transition-[color,transform] duration-150 ease-out active:scale-[0.98] ${
															isActiveSub ? 'font-medium !text-[#997DF5]' : 'text-gray-700 hover:text-firework-red'
														}`}
													>
														{sub.name}
													</Link>
												</li>
											)
										})}
									</ul>
								)}
							</li>
						)
					})}
			</ul>
		</nav>
	)
}
