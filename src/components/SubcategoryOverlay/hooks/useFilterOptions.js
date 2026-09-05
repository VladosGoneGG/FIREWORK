// src/components/SubcategoryOverlay/hooks/useFilterOptions.js
import { useCallback, useMemo } from 'react'
import { normalizeString } from '../../../utils/normalize'

const useFilterOptions = items => {
	const deriveOptions = useCallback(
		field =>
			Array.from(
				new Set(items.map(p => normalizeString(p?.[field])).filter(Boolean))
			),
		[items]
	)

	const PRODUCT_TYPES = useMemo(
		() =>
			Array.from(
				new Set(items.map(p => normalizeString(p?.category)).filter(Boolean))
			),
		[items]
	)
	const MANUFACTURERS = useMemo(
		() => deriveOptions('manufacturer'),
		[deriveOptions]
	)
	const POWERS = useMemo(() => deriveOptions('power'), [deriveOptions])

	const SHOTS_PRESETS = [1, 2, 3, 4, 50, 100]

	return {
		PRODUCT_TYPES,
		MANUFACTURERS,
		POWERS,
		SHOTS_PRESETS,
	}
}

export default useFilterOptions

