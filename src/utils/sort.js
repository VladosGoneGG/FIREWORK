// src/utils/sort.js
export const SORT_KEYS = {
	CHEAP: 'price-asc',
	EXPENSIVE: 'price-desc',
}

const getUnitPrice = p => {
	if (typeof p?.discountPrice === 'number') return p.discountPrice
	if (typeof p?.price === 'number') return p.price
	return Number.POSITIVE_INFINITY
}

export function applySort(list = [], sortKey = SORT_KEYS.CHEAP) {
	const arr = Array.isArray(list) ? [...list] : []
	if (sortKey === SORT_KEYS.EXPENSIVE || sortKey === 'price-desc') {
		arr.sort((a, b) => getUnitPrice(b) - getUnitPrice(a))
	} else {
		// по умолчанию — дешевле сначала
		arr.sort((a, b) => getUnitPrice(a) - getUnitPrice(b))
	}
	return arr
}
