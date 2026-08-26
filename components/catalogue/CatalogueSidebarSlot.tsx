'use client'

import { AnimatePresence } from 'motion/react'
import { useFiltersOpen } from './FiltersOpenContext'

// Mirrors App.jsx's left column: CategoryFilter+PromoPanel appear/disappear
// instantly when filters close/open (App.jsx: `{!filtersOpen && <CategoryFilter/>}`,
// no motion wrapper there), while SubcategoryOverlay animates its own
// height/opacity rather than being cut instantly — AnimatePresence here lets
// FilterPanel's `exit` variant play before it actually leaves the tree,
// instead of the previous plain ternary swap that unmounted it immediately.
export default function CatalogueSidebarSlot({
	categoryNav,
	filterPanel,
}: {
	categoryNav: React.ReactNode
	filterPanel: React.ReactNode
}) {
	const { open } = useFiltersOpen()
	return (
		<>
			{!open && categoryNav}
			<AnimatePresence>{open && filterPanel}</AnimatePresence>
		</>
	)
}
