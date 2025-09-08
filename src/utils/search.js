// простой скоринг по name / manufacturer
export function scoreItem(q, item) {
	const query = (q || '').trim().toLowerCase()
	if (!query) return 0

	const fields = [
		String(item.name || '').toLowerCase(),
		String(item.manufacturer || '').toLowerCase(),
	]

	let best = 0
	for (const f of fields) {
		if (!f) continue
		if (f === query) return 100 // точное совпадение — максимум
		if (f.startsWith(query)) best = Math.max(best, 60)
		if (f.includes(query)) best = Math.max(best, 40)
	}
	return best
}

export function getSuggestions(items, q, limit = 10) {
	if (!Array.isArray(items) || !items.length) return []
	const scored = items
		.map(it => ({ it, s: scoreItem(q, it) }))
		.filter(x => x.s > 0)
		.sort((a, b) => b.s - a.s)
		.slice(0, limit)
		.map(x => x.it)

	return scored
}
