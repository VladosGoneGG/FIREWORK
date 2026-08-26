'use client'

import { createContext, useContext, useState } from 'react'

interface FiltersOpenValue {
	open: boolean
	toggle: () => void
	close: () => void
}

const FiltersOpenCtx = createContext<FiltersOpenValue | null>(null)

/**
 * Shared open/closed state for the desktop filter swap: the original's
 * "фильтр" button lives inside the catalogue card's control row, but the
 * panel it opens replaces the category sidebar in a completely different
 * part of the tree (App.jsx: CategoryFilter unmounts, SubcategoryOverlay
 * takes its place in the same 240px column). A context is the natural way
 * to share one open/close boolean between those two unrelated positions in
 * the render tree without prop-drilling through page-specific layout.
 */
export function FiltersOpenProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false)
	return (
		<FiltersOpenCtx.Provider
			value={{
				open,
				toggle: () => setOpen(v => !v),
				close: () => setOpen(false),
			}}
		>
			{children}
		</FiltersOpenCtx.Provider>
	)
}

export function useFiltersOpen(): FiltersOpenValue {
	const ctx = useContext(FiltersOpenCtx)
	if (!ctx) throw new Error('useFiltersOpen must be used within a FiltersOpenProvider')
	return ctx
}
