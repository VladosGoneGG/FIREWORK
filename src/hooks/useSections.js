// src/hooks/useSections.js
import { useMemo } from 'react'

export default function useSections(discounted, nonDiscounted, selected) {
	return useMemo(() => {
		const res = []
		if (discounted.length > 0) res.push({ title: 'Акции', items: discounted })

		const sel = (selected || 'all').toLowerCase()
		if (sel !== 'all') {
			res.push({
				title: selected[0]?.toUpperCase() + selected.slice(1),
				items: nonDiscounted,
			})
			return res
		}

		// "Все" — разбивка по категориям (по всем товарам, а не только
		// не-акционным, иначе категория, где всё сейчас со скидкой,
		// вообще не получает своей секции и "теряется" при скролле).
		const map = new Map()
		for (const p of [...discounted, ...nonDiscounted]) {
			const key = p.category || 'Без категории'
			if (!map.has(key)) map.set(key, [])
			map.get(key).push(p)
		}
		for (const [title, items] of map) res.push({ title, items })
		return res
	}, [discounted, nonDiscounted, selected])
}
