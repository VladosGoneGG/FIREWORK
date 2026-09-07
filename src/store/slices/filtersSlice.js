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
	// Отрицательное/нечисловое значение отбрасывается, а не сохраняется как
	// "настоящая" граница — иначе, например, priceMin=-50 у нас на клиенте
	// считался бы заданной границей (и лишал бы результата товары без цены),
	// а бэкенд (parseFiniteNonNegative в catalog.service.js) её же тихо
	// отбрасывает как невалидную — превью и финальный результат расходились
	// бы именно из-за этого, а не из-за разницы в подгруженных данных.
	const bound = v => {
		if (v == null || v === '') return undefined
		const n = Number(v)
		return Number.isFinite(n) && n >= 0 ? n : undefined
	}
	const range = o => {
		if (!o) return null
		const r = {}
		const min = bound(o.min)
		const max = bound(o.max)
		if (min !== undefined) r.min = min
		if (max !== undefined) r.max = max
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
export const selectFiltersForm = s => s.filters.form
export const selectAppliedFilters = s => s.filters.applied
export const selectShowFound = s => s.filters.showFound

// ---------- Мемоизированные селекторы ----------

// Превью-количество (по текущей, ещё не применённой форме) — показывается
// в модалке до нажатия "показать"/"применить". ПРИБЛИЖЁННОЕ значение: оно
// считается только по уже подгруженным на клиенте товарам
// (products.items), а не по всему каталогу на сервере — точный подсчёт по
// всему каталогу на каждое движение чекбокса означал бы запрос на сервер
// при каждом изменении формы. Итоговый результат после нажатия "показать"
// идёт через fetchQueryPage/useCatalogFilterQuery и всегда точен (см.
// productsSlice.js) — расхождение возможно только в этом превью-счётчике.
export const selectPreviewCount = createSelector(
	[selectProductsItems, selectFiltersForm],
	(items, form) => {
		const cleaned = cleanForm(form)
		return applyAdvancedFilter(items, cleaned).length
	}
)
