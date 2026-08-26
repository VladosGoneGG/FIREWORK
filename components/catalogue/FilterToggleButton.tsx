'use client'

import { useFiltersOpen } from './FiltersOpenContext'

// The original's "фильтр" trigger — lives inside the catalogue card's
// control row (ProductPage.jsx's FilterBar / SubcategoryPanel's header),
// physically separate from the panel it opens (which replaces the
// category sidebar in a different column — see CatalogueSidebarSlot).
export default function FilterToggleButton() {
	const { open, toggle } = useFiltersOpen()
	return (
		<button
			type="button"
			onClick={toggle}
			className={`font-baron h-[26.5px] w-[70px] rounded-[10px] text-[10px] ${
				open ? 'bg-[#EFEBE7] text-[#BD52E9]' : 'btn-firework-filter'
			}`}
		>
			<span className="pb-[2px]">фильтр</span>
		</button>
	)
}
