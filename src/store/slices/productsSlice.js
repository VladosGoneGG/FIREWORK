// src/store/slices/productsSlice.js
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import mockProducts from '../../mocks/mockProducts'

// ================== Async ==================
export const fetchProducts = createAsyncThunk(
	'products/fetchProducts',
	async () => {
		return mockProducts
	}
)

// ================== Helpers ==================
const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

const getCurrentPrice = p => {
	const d = Number(p?.discountPrice)
	const base = Number(p?.price)
	if (Number.isFinite(d) && d > 0) return d
	if (Number.isFinite(base) && base > 0) return base
	return 0
}

// Простая эвристика "мощности"
const powerBucket = p => {
	const cal = Number(p?.caliber)
	if (Number.isFinite(cal)) {
		if (cal < 1.0) return 'слабый'
		if (cal <= 1.25) return 'средний'
		return 'мощный'
	}
	const eff = Number(p?.effectsCount)
	if (Number.isFinite(eff)) {
		if (eff < 4) return 'слабый'
		if (eff <= 8) return 'средний'
		return 'мощный'
	}
	return null
}

// Приведение формы price к нормальному виду
function normalizePriceInput(price, prev) {
	const prevMin = Number(prev?.min ?? 0)
	const prevMax = prev?.max ?? null

	const inMin = price?.min
	const inMax = price?.max

	let min = Number(inMin)
	if (!Number.isFinite(min) || min < 0) min = Math.max(0, prevMin)

	let max
	if (inMax === '' || inMax == null) {
		max = null
	} else {
		const parsed = Number(inMax)
		max = Number.isFinite(parsed) && parsed >= 0 ? parsed : prevMax
	}

	if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
		min = max
	}
	return { min, max }
}

// ================== State ==================
const INITIAL_FILTERS = {
	price: { min: 0, max: null }, // верхняя граница отсутствует по умолчанию
	types: [],
	manufacturers: [],
	shots: [],
	power: [], // 'слабый' | 'средний' | 'мощный'
	inStockOnly: false,
	hasCertificate: false,
}

const productsSlice = createSlice({
	name: 'products',
	initialState: {
		items: [],
		status: 'idle',
		error: null,
		searchQuery: '',
		filters: INITIAL_FILTERS,
	},
	reducers: {
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload
		},
		clearSearchQuery(state) {
			state.searchQuery = ''
		},

		setFilters(state, action) {
			const next = { ...state.filters, ...action.payload }
			next.price = normalizePriceInput(
				action.payload?.price,
				state.filters.price
			)

			if (!Array.isArray(next.types)) next.types = state.filters.types
			if (!Array.isArray(next.manufacturers))
				next.manufacturers = state.filters.manufacturers
			if (!Array.isArray(next.shots)) next.shots = state.filters.shots
			if (!Array.isArray(next.power)) next.power = state.filters.power

			next.inStockOnly = !!action.payload?.inStockOnly
			next.hasCertificate = !!action.payload?.hasCertificate

			state.filters = next
		},

		resetFilters(state) {
			state.filters = INITIAL_FILTERS
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchProducts.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.items = action.payload
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
	},
})

export const { setSearchQuery, clearSearchQuery, setFilters, resetFilters } =
	productsSlice.actions

/* ===================== Селекторы ===================== */
export const selectFilters = s => s.products.filters

export const selectDiscountedProducts = createSelector(
	[s => s.products.items],
	items =>
		items.filter(p => {
			const d = Number(p?.discountPrice)
			const base = Number(p?.price)
			return Number.isFinite(d) && d > 0 && (!Number.isFinite(base) || d < base)
		})
)

// Главный селектор (правка: корректная проверка price.max)
export const selectFilteredProducts = createSelector(
	[
		s => s.products.items,
		s => s.products.searchQuery,
		s => s.categories?.selectedCategory || 'all',
		selectFilters,
	],
	(items = [], searchQuery = '', selectedCategory = 'all', filters) => {
		const q = norm(searchQuery)
		const sel = norm(selectedCategory)

		const typesSet = new Set((filters?.types || []).map(norm))
		const manufacturersSet = new Set((filters?.manufacturers || []).map(norm))
		const shotsSet = new Set((filters?.shots || []).map(n => Number(n)))
		const powerSet = new Set((filters?.power || []).map(norm))

		const priceMin = Number(filters?.price?.min ?? 0)
		const priceMaxRaw = filters?.price?.max
		// >>> единственная принципиальная правка:
		const hasPriceMax =
			priceMaxRaw !== null && priceMaxRaw !== undefined && priceMaxRaw !== ''
		const priceMax = hasPriceMax ? Number(filters.price.max) : null

		const wantStock = !!filters?.inStockOnly
		const wantCert = !!filters?.hasCertificate

		return items.filter(p => {
			// Поиск
			const matchesSearch =
				!q ||
				norm(p.name).includes(q) ||
				norm(p.description).includes(q) ||
				norm(p.category).includes(q) ||
				norm(p.subcategory).includes(q) ||
				norm(p.manufacturer).includes(q)
			if (!matchesSearch) return false

			// Категория/подкатегория
			if (sel && sel !== 'all') {
				const productCat = norm(p.category)
				const productSub = norm(p.subcategory)
				if (!(sel === productSub || sel === productCat)) return false
			}

			// === ФИЛЬТРЫ ===
			const curPrice = getCurrentPrice(p)
			if (Number.isFinite(priceMin) && curPrice < priceMin) return false
			if (hasPriceMax && Number.isFinite(priceMax) && curPrice > priceMax)
				return false

			if (wantStock) {
				const sc = Number(p?.stock)
				if (Number.isFinite(sc) && sc <= 0) return false
			}

			if (wantCert && !String(p?.certificateUrl || '').trim()) return false

			if (typesSet.size) {
				const t = norm(p?.subcategory) || norm(p?.category)
				if (!typesSet.has(t)) return false
			}

			if (manufacturersSet.size) {
				const m = norm(p?.manufacturer)
				if (!manufacturersSet.has(m)) return false
			}

			if (shotsSet.size) {
				const sh = Number(p?.shots)
				if (!shotsSet.has(sh)) return false
			}

			if (powerSet.size) {
				const buck = powerBucket(p)
				if (!buck || !powerSet.has(buck)) return false
			}

			return true
		})
	}
)

export default productsSlice.reducer
