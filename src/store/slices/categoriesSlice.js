import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const mockCategories = [
	{ id: 0, name: 'Все', subcategories: [] },

	{
		id: 1,
		name: 'Салюты',
		subcategories: [
			{ id: 11, name: 'Батареи салютов' },
			{ id: 12, name: 'Мортиры' },
			{ id: 13, name: 'Ракеты' },
		],
	},

	{
		id: 2,
		name: 'Фонтаны',
		subcategories: [
			{ id: 21, name: 'Уличные' },
			{ id: 22, name: 'Для помещений' },
		],
	},

	{
		id: 3,
		name: 'Свечи',
		subcategories: [
			{ id: 31, name: 'Римские свечи' },
			{ id: 32, name: 'Бенгальские огни' },
			{ id: 33, name: 'Тортовые свечи' },
		],
	},

	{ id: 4, name: 'Хлопушки', subcategories: [] },

	{
		id: 5,
		name: 'Шоу',
		subcategories: [
			{ id: 51, name: 'Профессиональные' },
			{ id: 52, name: 'Домашние наборы' },
		],
	},

	{
		id: 6,
		name: 'Аксессуары',
		subcategories: [
			{ id: 61, name: 'Запалы' },
			{ id: 62, name: 'Фитили' },
		],
	},
]

// асинхронная загрузка категорий
export const fetchCategories = createAsyncThunk(
	'categories/fetchCategories',
	async () => {
		// здесь можно сделать реальный запрос на API
		// const response = await fetch('/api/categories')
		// return await response.json()

		return mockCategories // пока моковые данные
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
			const name = action.payload
			state.selectedCategory = name === 'все' ? 'all' : name
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
