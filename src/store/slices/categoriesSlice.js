import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import mockCategories from '../../mocks/mockCategories'

// асинхронная загрузка категорий
export const fetchCategories = createAsyncThunk(
	'categories/fetchCategories',
	async () => {
		return mockCategories
	}
)

const categoriesSlice = createSlice({
	name: 'categories',
	initialState: {
		list: [],
		selectedCategory: '',
		status: 'idle',
		error: null,
	},
	reducers: {
		setCategory(state, action) {
			const raw = (action.payload || '').toLowerCase().trim()
			state.selectedCategory = raw === 'все' ? 'all' : raw
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchCategories.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchCategories.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.list = action.payload
			})
			.addCase(fetchCategories.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
	},
})

export const { setCategory } = categoriesSlice.actions
export default categoriesSlice.reducer
