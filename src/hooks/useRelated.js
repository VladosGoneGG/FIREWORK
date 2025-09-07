// src/hooks/useRelated.js
import { useMemo } from 'react'

export default function useRelated(allItems, selectedProduct, limit = 10) {
	return useMemo(() => {
		if (!selectedProduct) return []
		return allItems
			.filter(
				p =>
					p.category === selectedProduct.category && p.id !== selectedProduct.id
			)
			.slice(0, limit)
	}, [allItems, selectedProduct, limit])
}
