// src/store/slices/productsSlice.js
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { getProducts } from '../../api/productsApi' // см. ранее предложенную обёртку

// ——— нормализация полей из бэка под текущий фронт ———
const normalizeProduct = p => ({
	id: p.id,
	name: p.name ?? '',
	manufacturer: p.manufacturer ?? '',
	shots: p.shots ?? null,
	caliber: p.caliber ?? null,
	// у бэка поле называется duration — у нас durationSec
	durationSec: p.duration ?? p.durationSec ?? null,
	// у бэка effects — у нас effectsCount
	effectsCount: p.effects ?? p.effectsCount ?? null,
	// certificate/certificateFile → certificateUrl
	certificateUrl: p.certificate ?? p.certificateFile ?? null,
	stock: typeof p.stock === 'number' ? p.stock : null,
	price: typeof p.price === 'number' ? p.price : null,
	discountPrice: typeof p.discountPrice === 'number' ? p.discountPrice : null,
	description: p.description ?? '',
	// список медиа бэк отдаёт отдельным эндпоинтом; здесь — пусто
	images: p.images ?? [],
	video: null,
	// доп. для удобства: категория/подкатегория, если появятся в ответе
	category: p.category ?? '',
	subcategory: p.subcategory ?? '',
})

// ——— Асинхронный thunk: тянем товары с API ———
export const fetchProducts = createAsyncThunk(
	'products/fetchProducts',
	async (_, { rejectWithValue }) => {
		try {
			const data = await getProducts()
			return Array.isArray(data) ? data.map(normalizeProduct) : []
		} catch (err) {
			return rejectWithValue(err?.message || 'Ошибка загрузки товаров')
		}
	}
)

const productsSlice = createSlice({
	name: 'products',
	initialState: {
		items: [],
		status: 'idle', // idle | loading | succeeded | failed
		error: null,
		searchQuery: '',
	},
	reducers: {
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload
		},
		clearSearchQuery(state) {
			state.searchQuery = ''
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchProducts.pending, state => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.items = action.payload
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error?.message || 'Ошибка'
			})
	},
})

export const { setSearchQuery, clearSearchQuery } = productsSlice.actions

// товары со скидкой
export const selectDiscountedProducts = createSelector(
	[state => state.products.items],
	items => items.filter(p => typeof p.discountPrice === 'number')
)

// основной фильтр (категория/подкатегория/поиск)
export const selectFilteredProducts = createSelector(
	[
		s => s.products.items,
		s => s.products.searchQuery,
		s => s.categories.selectedCategory || 'all',
	],
	(items = [], searchQuery = '', selectedCategory = 'all') => {
		const q = (searchQuery || '').toLowerCase().trim()
		const sel = (selectedCategory || 'all').toLowerCase().trim()

		return items.filter(p => {
			const matchesSearch =
				!q ||
				p.name.toLowerCase().includes(q) ||
				(p.description || '').toLowerCase().includes(q) ||
				(p.category || '').toLowerCase().includes(q) ||
				(p.subcategory || '').toLowerCase().includes(q) ||
				(p.manufacturer || '').toLowerCase().includes(q)

			if (!sel || sel === 'all') return matchesSearch

			const productCat = (p.category || '').toLowerCase()
			const productSub = (p.subcategory || '').toLowerCase()
			if (sel === productSub || sel === productCat) return matchesSearch
			return false
		})
	}
)

// export default productsSlice.reducer
