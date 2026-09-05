// src/store/slices/filtersSlice.js
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { applyAdvancedFilter } from '../../utils/filters'

// ---------- Формы ----------
const initialForm = {
	tags: [],
	types: [],
	manufacturers: [],
	shots: [],
	power: [],
	price: { min: null, max: null },
	time: { min: null, max: null },
}

function setByPath(obj, path, value) {
	const parts = String(path).split('.')
	const last = parts.pop()
	let cur = obj
	for (const p of parts) {
		if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {}
		cur = cur[p]
	}
	cur[last] = value
}

function cleanForm(form) {
	const f = JSON.parse(JSON.stringify(form || {}))
	const arrFields = ['tags', 'types', 'manufacturers', 'shots', 'power']
	for (const k of arrFields) {
		if (!Array.isArray(f[k]) || f[k].length === 0) delete f[k]
	}
	const range = o => {
		if (!o || (o.min == null && o.max == null)) return null
		const r = {}
		if (o.min != null && o.min !== '') r.min = Number(o.min)
		if (o.max != null && o.max !== '') r.max = Number(o.max)
		return r.min == null && r.max == null ? null : r
	}
	const p = range(f.price)
	const t = range(f.time)
	if (p) f.price = p
	else delete f.price
	if (t) f.time = t
	else delete f.time
	return f
}

// ---------- Slice ----------
const filtersSlice = createSlice({
	name: 'filters',
	initialState: {
		form: initialForm, // редактируемая форма (превью)
		applied: null, // последний применённый набор фильтров
		showFound: false, // включать FoundSection
	},
	reducers: {
		setField(state, { payload: { path, value } }) {
			setByPath(state.form, path, value)
		},
		setForm(state, { payload }) {
			state.form = { ...initialForm, ...(payload || {}) }
		},
		resetForm(state) {
			state.form = { ...initialForm }
			state.applied = null
			state.showFound = false
		},
		applyNow(state) {
			state.applied = cleanForm(state.form)
			state.showFound = true
		},
		clearApplied(state) {
			state.applied = null
			state.showFound = false
		},
		setShowFound(state, { payload }) {
			state.showFound = !!payload
		},
	},
})

export const {
	setField,
	setForm,
	resetForm,
	applyNow,
	clearApplied,
	setShowFound,
} = filtersSlice.actions

export default filtersSlice.reducer

// ---------- Базовые селекторы ----------
const selectProductsItems = s => s.products?.items || []
const selectQueryItems = s => s.products?.query?.items || []
const selectSearchRaw = s => s.products?.searchQuery || ''
export const selectFiltersForm = s => s.filters.form
export const selectAppliedFilters = s => s.filters.applied
export const selectShowFound = s => s.filters.showFound

// ---------- Утилы для поиска ----------
const norm = v =>
	String(v ?? '')
		.toLowerCase()
		.replaceAll('ё', 'е')
		.trim()

// ---------- Мемоизированные селекторы ----------

// Превью-количество (по текущей форме) — можно оставить немемоизированным,
// но сделаем мемо для стабильности UI.
export const selectPreviewCount = createSelector(
	[selectProductsItems, selectFiltersForm],
	(items, form) => {
		const cleaned = cleanForm(form)
		return applyAdvancedFilter(items, cleaned).length
	}
)

// FoundSection = поиск ∩ applied-фильтры. Возвращаем:
// - null — если нет ни поиска, ни applied (чтобы секция скрывалась);
// - массив (тот же самый экземпляр при одинаковых входах) — иначе.
//
// Текстовый поиск теперь фильтруется на сервере (см. fetchQueryPage /
// useCatalogFilterQuery) — поэтому при активном поиске базой служит
// products.query.items (уже отфильтрованный сервером набор), а не весь
// накопленный каталог. matchesSearch больше не нужен для этого случая:
// повторная фильтрация по searchRaw на клиенте могла бы на секунду
// показать пустой результат, пока debounce ещё не долетел до сервера.
// Если поиска нет, а есть только "продвинутые" фильтры (модалка "фильтр"),
// поведение не меняется — они по-прежнему применяются к всему каталогу.
export const selectFoundItems = createSelector(
	[selectProductsItems, selectQueryItems, selectAppliedFilters, selectSearchRaw],
	(items, queryItems, applied, searchRaw) => {
		const hasSearch = norm(searchRaw).length > 0
		const hasApplied = !!applied

		if (!hasSearch && !hasApplied) return null

		let base = hasSearch ? queryItems : items
		if (hasApplied) base = applyAdvancedFilter(base, applied)

		return base
	}
)
