import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCategories } from '../../api/productsApi'

// Лёгкий эндпоинт: список категорий, а не все 580 товаров ради их названий.
export const fetchCategories = createAsyncThunk(
	'categories/fetchCategories',
	async () => {
		const data = await getCategories()

		const list = (Array.isArray(data) ? data : []).map(c => ({
			id: c.code ?? c.name,
			name: c.name,
			code: c.code ?? null,
			subcategories: [], // источник не отдаёт иерархию подкатегорий
		}))

		// Псевдо-категория "все" — CategoryFilter ожидает её первым элементом
		// списка (индекс 0 = иконка "все", клик сбрасывает выбор категории).
		return [{ id: 'all', name: 'все', subcategories: [] }, ...list]
	}
)

const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

const categoriesSlice = createSlice({
	name: 'categories',
	initialState: {
		list: [],
		selectedCategory: 'all', // ключ категории или 'all'
		selectedSub: '', // ключ подкатегории (если выбрана подкатегория)
		status: 'idle',
		error: null,
	},
	reducers: {
		// простой сет, если где-то нужен
		setCategory(state, action) {
			const raw = norm(action.payload)
			if (raw === 'all') {
				state.selectedCategory = 'all'
				state.selectedSub = ''
			} else {
				state.selectedCategory = raw
				state.selectedSub = '' // не знаем — считаем это категорией
			}
		},

		// умный сет: распознаёт, это категория или подкатегория
		setCategorySmart(state, action) {
			const key = norm(action.payload)

			if (!key || key === 'all' || key === 'все') {
				state.selectedCategory = 'all'
				state.selectedSub = ''
				return
			}

			// построим быстрые lookup-таблицы
			const catKeys = new Map() // catKey -> catId
			const subToCatKey = new Map() // subKey -> parentCatKey

			for (const c of state.list) {
				const cKey = norm(c.name)
				if (cKey) catKeys.set(cKey, c.id)
				for (const s of c.subcategories || []) {
					const sKey = norm(s.name)
					if (sKey) subToCatKey.set(sKey, cKey)
				}
			}

			if (catKeys.has(key)) {
				// выбрана категория
				state.selectedCategory = key
				state.selectedSub = ''
				return
			}

			const parentCatKey = subToCatKey.get(key)
			if (parentCatKey) {
				// выбрана подкатегория
				state.selectedCategory = parentCatKey
				state.selectedSub = key
				return
			}

			// fallback — считаем это категорией
			state.selectedCategory = key
			state.selectedSub = ''
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
				state.error = action.error?.message || 'load failed'
			})
	},
})

export const { setCategory, setCategorySmart } = categoriesSlice.actions
export default categoriesSlice.reducer
