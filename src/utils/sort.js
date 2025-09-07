// src/utils/sort.js
export const SORT_KEYS = {
	CHEAP: 'cheap',
	EXP: 'exp',
	NEW: 'new',
	POP: 'pop',
}

const byEffPriceAsc = (a, b) =>
	(a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
const byEffPriceDesc = (a, b) =>
	(b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)

export const sortFns = {
	[SORT_KEYS.CHEAP]: arr => [...arr].sort(byEffPriceAsc),
	[SORT_KEYS.EXP]: arr => [...arr].sort(byEffPriceDesc),
	[SORT_KEYS.NEW]: arr => [...arr], // заглушки — позже подменишь
	[SORT_KEYS.POP]: arr => [...arr],
}

export const applySort = (arr, key) => {
	const fn = sortFns[key]
	return fn ? fn(arr) : arr
}
