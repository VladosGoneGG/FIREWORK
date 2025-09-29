// src/hooks/useOverlayFilters.js
import { useCallback, useMemo, useState } from 'react'

const isEmpty = v => v === '' || v === null || v === undefined
const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
const toNum = v => (v === '' || v === null || v === undefined ? '' : Number(v))
const isEmptyRange = r => {
	if (!r) return true
	const min = toNum(r.min)
	const max = toNum(r.max)
	return (min === '' || Number.isNaN(min)) && (max === '' || Number.isNaN(max))
}

// иммутабельное обновление по "a.b.c"
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
		// строки
		name: '',
		manufacturer: '',
		category: '',
		subcategory: '',
		caliberText: '',

		// диапазоны
		shots: { min: '', max: '' },
		caliber: { min: '', max: '' },
		durationSec: { min: '', max: '' },
		effectsCount: { min: '', max: '' },
		price: { min: '', max: '' },

		// флаги
		hasCertificate: false,
		inStockOnly: false,

		// массивы мультивыбора
		types: [], // ['дым', 'петарды', ...]
		manufacturers: [], // ['Piroff', 'Joker', ...]
		shotsList: [], // [1,2,3,4]
		power: [], // ['слабый','средний','мощный']
	}

	const [form, setForm] = useState(initial)

	const setField = useCallback((path, value) => {
		setForm(prev => setByPath(prev, path, value))
	}, [])

	const reset = useCallback(() => setForm(initial), [])

	const normalized = useMemo(() => {
		const out = {}

		const trim = v => (isEmpty(v) ? '' : String(v).trim())

		// строки
		if (trim(form.name)) out.name = trim(form.name)
		if (trim(form.manufacturer)) out.manufacturer = trim(form.manufacturer)
		if (trim(form.category)) out.category = trim(form.category)
		if (trim(form.subcategory)) out.subcategory = trim(form.subcategory)
		if (trim(form.caliberText)) out.caliberText = trim(form.caliberText)

		// диапазоны -> числа, пропускаем пустые края
		const pushRange = key => {
			if (!isEmptyRange(form[key])) {
				const min = toNum(form[key].min)
				const max = toNum(form[key].max)
				out[key] = {
					...(min === '' || Number.isNaN(min) ? {} : { min }),
					...(max === '' || Number.isNaN(max) ? {} : { max }),
				}
			}
		}
		;['shots', 'caliber', 'durationSec', 'effectsCount', 'price'].forEach(
			pushRange
		)

		// флаги
		if (form.hasCertificate) out.hasCertificate = true
		if (form.inStockOnly) out.inStockOnly = true

		// массивы
		if (toArr(form.types).length) out.types = toArr(form.types)
		if (toArr(form.manufacturers).length)
			out.manufacturers = toArr(form.manufacturers)
		if (toArr(form.shotsList).length) out.shotsList = toArr(form.shotsList)
		if (toArr(form.power).length) out.power = toArr(form.power)

		return out
	}, [form])

	return { form, setForm, setField, reset, normalized }
}

/* Утилита фильтрации: опционально можно вынести в отдельный файл */
export function applyFilters(products, f = {}) {
	const list = Array.isArray(products) ? products : []
	return list.filter(p => {
		const price =
			typeof p?.discountPrice === 'number'
				? p.discountPrice
				: typeof p?.price === 'number'
				? p.price
				: Number.POSITIVE_INFINITY

		if (
			f.price?.min != null &&
			Number.isFinite(f.price.min) &&
			price < f.price.min
		)
			return false
		if (
			f.price?.max != null &&
			Number.isFinite(f.price.max) &&
			price > f.price.max
		)
			return false

		if (f.inStockOnly && !p?.inStock) return false
		if (f.hasCertificate && !p?.hasCertificate) return false

		if (
			f.name &&
			!String(p?.name || '')
				.toLowerCase()
				.includes(String(f.name).toLowerCase())
		)
			return false
		if (f.manufacturer && String(p?.manufacturer) !== f.manufacturer)
			return false
		if (f.category && String(p?.category) !== f.category) return false
		if (f.subcategory && String(p?.subcategory) !== f.subcategory) return false

		// диапазоны
		const inRange = (val, range) => {
			if (range?.min != null && Number.isFinite(range.min) && val < range.min)
				return false
			if (range?.max != null && Number.isFinite(range.max) && val > range.max)
				return false
			return true
		}
		if (f.shots && !inRange(p?.shots ?? Number.NaN, f.shots)) return false
		if (f.caliber && !inRange(p?.caliber ?? Number.NaN, f.caliber)) return false
		if (f.durationSec && !inRange(p?.durationSec ?? Number.NaN, f.durationSec))
			return false
		if (
			f.effectsCount &&
			!inRange(p?.effectsCount ?? Number.NaN, f.effectsCount)
		)
			return false

		// массивы мультивыбора
		const has = (arr, val) => !arr?.length || arr.includes(val)
		if (!has(f.types, p?.type)) return false
		if (!has(f.manufacturers, p?.manufacturer)) return false
		if (!has(f.shotsList, p?.shots)) return false
		if (!has(f.power, p?.power)) return false

		// текст по калибру (если нужно по подстроке)
		if (f.caliberText) {
			const txt = String(p?.caliberText || p?.caliber || '').toLowerCase()
			if (!txt.includes(String(f.caliberText).toLowerCase())) return false
		}

		return true
	})
}
