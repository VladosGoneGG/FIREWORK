// src/hooks/useOverlayFilters.js
import { useCallback, useMemo, useState } from 'react'

const isEmpty = v => v === '' || v === null || v === undefined
const isEmptyRange = r => !r || (isEmpty(r.min) && isEmpty(r.max))

// обновление значения по "точечному" пути: "price.min"
function setByPath(obj, path, value) {
	const keys = String(path).split('.')
	const res = { ...obj }
	let cur = res
	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i]
		cur[k] = typeof cur[k] === 'object' && cur[k] !== null ? { ...cur[k] } : {}
		cur = cur[k]
	}
	cur[keys[keys.length - 1]] = value
	return res
}

export default function useOverlayFilters() {
	const initial = {
		name: '',
		manufacturer: '',
		category: '',
		subcategory: '',
		// диапазоны
		shots: { min: '', max: '' },
		caliber: { min: '', max: '' }, // можно вводить диапазон
		durationSec: { min: '', max: '' },
		effectsCount: { min: '', max: '' },
		price: { min: '', max: '' },
		// флажки
		hasCertificate: false,
		inStockOnly: false,
		// альтернативное строковое поле для калибра, если хочешь искать по подстроке
		caliberText: '', // опционально; если пусто — игнорируем
	}

	const [form, setForm] = useState(initial)

	// умный setField: понимает "a.b.c"
	const setField = useCallback((path, value) => {
		setForm(prev => setByPath(prev, path, value))
	}, [])

	const reset = useCallback(() => setForm(initial), [])

	// отдаём наружу только реально заполненные поля
	const normalized = useMemo(() => {
		const out = {}

		const trim = v => (isEmpty(v) ? '' : String(v).trim())

		if (!isEmpty(trim(form.name))) out.name = trim(form.name)
		if (!isEmpty(trim(form.manufacturer)))
			out.manufacturer = trim(form.manufacturer)
		if (!isEmpty(trim(form.category))) out.category = trim(form.category)
		if (!isEmpty(trim(form.subcategory)))
			out.subcategory = trim(form.subcategory)

		if (!isEmptyRange(form.shots)) out.shots = form.shots
		if (!isEmptyRange(form.caliber)) out.caliber = form.caliber
		if (!isEmptyRange(form.durationSec)) out.durationSec = form.durationSec
		if (!isEmptyRange(form.effectsCount)) out.effectsCount = form.effectsCount
		if (!isEmptyRange(form.price)) out.price = form.price

		if (!isEmpty(trim(form.caliberText)))
			out.caliberText = trim(form.caliberText)

		if (form.hasCertificate) out.hasCertificate = true
		if (form.inStockOnly) out.inStockOnly = true

		return out
	}, [form])

	return { form, setForm, setField, reset, normalized }
}
