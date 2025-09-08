// src/utils/sort.js
export const SORT_KEYS = {
	CHEAP: 'cheap',
	EXP: 'exp',
	NEW: 'new',
	POP: 'pop',
}

const priceOf = p => p?.discountPrice ?? p?.price ?? Infinity

const cheap = (arr = []) => [...arr].sort((a, b) => priceOf(a) - priceOf(b))
const exp = (arr = []) => [...arr].sort((a, b) => priceOf(b) - priceOf(a))

export const applySort = (arr, key) => {
	const list = Array.isArray(arr) ? arr : []
	switch (key) {
		case SORT_KEYS.EXP:
			return exp(list)
		case SORT_KEYS.NEW:
			// TODO: своя логика сортировки "новых"
			return list
		case SORT_KEYS.POP:
			// TODO: своя логика сортировки "популярных"
			return list
		case SORT_KEYS.CHEAP:
		default:
			return cheap(list)
	}
}
