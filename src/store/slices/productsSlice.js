import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

// Моковые товары салютов
const mockProducts = [
	// 🔥 Салюты
	{
		id: 1,
		name: 'Фейерверк «Салют 100»',
		category: 'Салюты',
		subcategory: 'Батареи салютов',
		price: 1500,
		description: 'Яркий салют на 100 выстрелов',
	},
	{
		id: 2,
		name: 'Батарея салютов «Энергия»',
		category: 'Салюты',
		subcategory: 'Батареи салютов',
		price: 2500,
		description: 'Сборная батарея с разноцветными эффектами',
	},
	{
		id: 3,
		name: 'Салют «Звёздная ночь»',
		category: 'Салюты',
		subcategory: '',
		price: 1800,
		description: 'Красивые серебряные и золотые вспышки',
	},
	{
		id: 4,
		name: 'Батарея салютов «Огненный вихрь»',
		category: 'Салюты',
		subcategory: 'Батареи салютов',
		price: 2700,
		description: 'Длительная батарея с разными эффектами',
	},
	{
		id: 5,
		name: 'Фейерверк «Галактика»',
		category: 'Салюты',
		subcategory: '',
		price: 3200,
		description: 'Мощный фейерверк с многоуровневыми залпами',
	},

	// 🌊 Фонтаны
	{
		id: 6,
		name: 'Фонтан «Золотой дождь»',
		category: 'Фонтаны',
		subcategory: '',
		price: 1200,
		description: 'Золотой блестящий фонтан 2 мин',
	},
	{
		id: 7,
		name: 'Фонтан «Сияние»',
		category: 'Фонтаны',
		subcategory: '',
		price: 1300,
		description: 'Эффектный фонтан для праздника',
	},
	{
		id: 8,
		name: 'Фонтан «Вулкан»',
		category: 'Фонтаны',
		subcategory: '',
		price: 1600,
		description: 'Фонтан в форме вулкана с огненными искрами',
	},

	// 🕯 Свечи и огни
	{
		id: 9,
		name: 'Римская свеча «Серебро»',
		category: 'Свечи',
		subcategory: 'Римские свечи',
		price: 800,
		description: 'Декоративная римская свеча с серебряными вспышками',
	},
	{
		id: 10,
		name: 'Римская свеча «Золотой дождь»',
		category: 'Свечи',
		subcategory: 'Римские свечи',
		price: 900,
		description: 'Красивый золотой эффект',
	},
	{
		id: 11,
		name: 'Бенгальские огни «Классика»',
		category: 'Свечи',
		subcategory: 'Бенгальские огни',
		price: 300,
		description: 'Традиционные бенгальские огни для праздников',
	},
	{
		id: 12,
		name: 'Бенгальские огни «XXL»',
		category: 'Свечи',
		subcategory: 'Бенгальские огни',
		price: 500,
		description: 'Длинные бенгальские огни до 1 минуты горения',
	},

	// 🎉 Хлопушки
	{
		id: 13,
		name: 'Хлопушка «Весёлый праздник»',
		category: 'Хлопушки',
		subcategory: '',
		price: 200,
		description: 'Безопасная хлопушка с конфетти',
	},
	{
		id: 14,
		name: 'Хлопушка «Сюрприз»',
		category: 'Хлопушки',
		subcategory: '',
		price: 350,
		description: 'Хлопушка с разноцветным наполнением',
	},

	// 🎆 Шоу
	{
		id: 15,
		name: 'Пиротехническое шоу «Фестиваль»',
		category: 'Шоу',
		subcategory: '',
		price: 5000,
		description: 'Профессиональное шоу на 5 минут с музыкой',
	},
	{
		id: 16,
		name: 'Шоу «Фейерверк вечер»',
		category: 'Шоу',
		subcategory: '',
		price: 5200,
		description: 'Профессиональное шоу с музыкой и огнем',
	},
	{
		id: 17,
		name: 'Пиротехническое шоу «Гранд финал»',
		category: 'Шоу',
		subcategory: '',
		price: 8000,
		description: 'Эпическое финальное шоу с синхронизацией музыки',
	},
]

const CATEGORY_SYNONYMS = {
	фейерверки: 'салюты',
	'батареи салютов': 'салюты', // подкатегория -> родитель
	'римские свечи': 'свечи',
	'бенгальские огни': 'свечи',
	хлопушки: 'хлопушки',
	салюты: 'салюты',
	фонтаны: 'фонтаны',
	фонтан: 'фонтаны',
	шоу: 'шоу',
	все: 'all',
	all: 'all',
}

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

export const selectFilteredProducts = createSelector(
	[
		state => state.products.items,
		state => state.products.searchQuery,
		state => state.categories.selectedCategory || 'all',
	],
	(items = [], searchQuery = '', selectedCategory = 'all') => {
		const q = (searchQuery || '').toLowerCase().trim()
		const sel = (selectedCategory || 'all').toLowerCase().trim()

		return items.filter(p => {
			const matchesSearch =
				!q ||
				p.name.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				(p.category || '').toLowerCase().includes(q) ||
				(p.subcategory || '').toLowerCase().includes(q)

			if (!sel || sel === 'all') return matchesSearch

			const productCat = (p.category || '').toLowerCase()
			const productSub = (p.subcategory || '').toLowerCase()

			// Сравниваем выбранное значение с подкатегорией или родительской категорией
			if (sel === productSub || sel === productCat) return matchesSearch

			return false
		})
	}
)
export default productsSlice.reducer
