import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import mockProducts from '../../mocks/mockProducts'

// Асинхронный thunk
export const fetchProducts = createAsyncThunk(
	'products/fetchProducts',
	async () => {
		return mockProducts
	}
)

const productsSlice = createSlice({
	name: 'products',
	initialState: {
		items: [],
		status: 'idle',
		error: null,
		searchQuery: '',
	},
	reducers: {
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload
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

export const { setSearchQuery } = productsSlice.actions

export const selectDiscountedProducts = createSelector(
	[state => state.products.items],
	items => items.filter(p => typeof p.discountPrice === 'number')
)

// Существующий фильтр оставляем — он уже учитывает category/subcategory/search
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

export default productsSlice.reducer
