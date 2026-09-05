// src/store/slices/productsSlice.js
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import {
	getCatalogPage,
	getProductById as apiGetProductById,
} from '../../api/productsApi'
import { powerBucket } from '../../utils/power'

const EMPTY_EXTRAS = {
	// Карточка каталога не содержит эти поля — появляются только после
	// подгрузки полной карточки через fetchProductDetail. В моках были
	// придуманы значения; в реальном источнике их нет вовсе.
	subcategory: '',
	certificateNumber: '',
	description: '',
	effects: [],
	video: null,
	tags: [],
}

// ================== Нормализация ==================
// Лёгкая карточка из GET /api/v1/catalog (страница списка/главной).
function normalizeCatalogItem(item = {}) {
	const pricing = item.pricing || {}
	const specs = item.specifications || {}
	const duration = specs.duration || {}
	const caliber = specs.caliber || {}
	const caliberValue = typeof caliber.value === 'number' ? caliber.value : null
	const effectsCount =
		typeof specs.effectsCount === 'number' ? specs.effectsCount : null

	return {
		id: item.id,
		name: item.name ?? '',
		manufacturer: item.brand ?? '',
		category: item.category ?? '',
		categoryCode: item.categoryCode ?? null,
		shots: typeof specs.shots === 'number' ? specs.shots : null,
		caliber: caliberValue,
		durationSec: typeof duration.value === 'number' ? duration.value : null,
		effectsCount,
		stock: typeof item.stock === 'number' ? item.stock : 0,
		price: typeof pricing.regularPrice === 'number' ? pricing.regularPrice : null,
		discountPrice:
			typeof pricing.salePrice === 'number' ? pricing.salePrice : null,
		currency: pricing.currency ?? 'RUB',
		images: item.image ? [item.image] : [],
		...EMPTY_EXTRAS,
		// Реальных данных о мощности нет — оцениваем по калибру/эффектам.
		power: powerBucket({ caliber: caliberValue, effectsCount }),
	}
}

// Полная карточка из GET /api/v1/products/:id (подгружается при открытии товара).
// Реальный API отдаёт вложенные группы полей — приводим к той же плоской форме.
// Поля, которых нет в реальных данных (subcategory, tags), не выдумываем —
// оставляем пустыми значениями того же типа.
function normalizeProduct(id, p = {}) {
	const pricing = p.pricing || {}
	const classification = p.classification || {}
	const category = classification.category || {}
	const specs = p.specifications || {}
	const duration = specs.duration || {}
	const caliber = specs.caliber || {}
	const media = p.media || {}
	const certification = p.certification || {}
	const inventory = p.inventory || {}
	const description = p.description || {}
	const effects = Array.isArray(description.effects) ? description.effects : []
	const caliberValue = typeof caliber.value === 'number' ? caliber.value : null
	const effectsCount =
		typeof specs.effectsCount === 'number' ? specs.effectsCount : null

	return {
		id,
		name: p.name ?? '',
		manufacturer: classification.brand ?? '',
		category: category.name ?? '',
		categoryCode: category.code ?? null,
		subcategory: '', // в источнике нет иерархии подкатегорий
		shots: typeof specs.shots === 'number' ? specs.shots : null,
		caliber: caliberValue,
		durationSec:
			typeof duration.maxSeconds === 'number' ? duration.maxSeconds : null,
		effectsCount,
		certificateNumber: certification.number ?? '',
		stock: typeof inventory.stock === 'number' ? inventory.stock : 0,
		price: typeof pricing.regularPrice === 'number' ? pricing.regularPrice : null,
		discountPrice:
			typeof pricing.salePrice === 'number' ? pricing.salePrice : null,
		currency: pricing.currency ?? 'RUB',
		images: Array.isArray(media.images) ? media.images : [],
		video: media.video ?? null,
		description: effects.join(' '),
		effects,
		// Реальных данных о мощности нет — оцениваем по калибру/эффектам.
		power: powerBucket({ caliber: caliberValue, effectsCount }),
		// Есть только в моках — реальный источник таких данных не отдаёт
		tags: [],
	}
}

// ================== Async ==================

// Одна страница каталога — не весь список сразу. Каждый вызов добавляет
// следующую порцию в state.products.items; "Загрузить ещё" просто зовёт
// это же с page + 1.
export const fetchProductsPage = createAsyncThunk(
	'products/fetchProductsPage',
	async ({ page = 1, limit = 48 } = {}, { rejectWithValue }) => {
		try {
			const data = await getCatalogPage({ page, limit })
			return {
				items: (data?.items || []).map(normalizeCatalogItem),
				pagination: data?.pagination || null,
			}
		} catch (err) {
			return rejectWithValue(
				err?.response?.data?.error || err?.message || 'Ошибка загрузки товаров'
			)
		}
	}
)

// Полные данные одного товара — лениво, при открытии карточки товара
// (сертификат/описание в карточке каталога не приходят).
export const fetchProductDetail = createAsyncThunk(
	'products/fetchProductDetail',
	async (id, { rejectWithValue }) => {
		try {
			const product = await apiGetProductById(id)
			return normalizeProduct(id, product)
		} catch (err) {
			return rejectWithValue(
				err?.response?.data?.error || err?.message || 'Ошибка загрузки товара'
			)
		}
	}
)

// Одна страница каталога, отфильтрованная сервером по category/search —
// используется вместо докачки всего каталога при выборе категории или
// поиске (см. useCatalogFilterQuery). thunkAPI.signal передаётся в axios,
// поэтому dispatch(...).abort() реально отменяет сетевой запрос.
export const fetchQueryPage = createAsyncThunk(
	'products/fetchQueryPage',
	async ({ category, search, page = 1, limit = 48 } = {}, { signal, rejectWithValue }) => {
		try {
			const data = await getCatalogPage({ page, limit, category, search, signal })
			return {
				items: (data?.items || []).map(normalizeCatalogItem),
				pagination: data?.pagination || null,
			}
		} catch (err) {
			return rejectWithValue(
				err?.response?.data?.error || err?.message || 'Ошибка загрузки товаров'
			)
		}
	}
)

const QUERY_CACHE_TTL_MS = 2 * 60 * 1000
const QUERY_CACHE_MAX_ENTRIES = 8

export function makeQueryKey(category, search) {
	const c = String(category || '').trim().toLowerCase()
	const s = String(search || '').trim().toLowerCase()
	return `${c}|${s}`
}

// Не createAsyncThunk: сначала проверяет лёгкий in-memory кэш (переключение
// обратно на недавно открытую категорию/запрос — без сети), и только если
// кэша нет или он устарел — реально идёт в API. Возвращает то, что вернул
// dispatch(fetchQueryPage(...)) (со свойством .abort()) либо null, если
// обошлись кэшем — вызывающая сторона может это использовать для отмены
// предыдущего запроса при быстрой смене категории/поиска.
export function loadCatalogQuery({ category, search } = {}) {
	return (dispatch, getState) => {
		const key = makeQueryKey(category, search)
		const cached = getState().products.queryCache[key]
		const isFresh = cached && Date.now() - cached.updatedAt < QUERY_CACHE_TTL_MS

		if (isFresh) {
			dispatch(
				productsSlice.actions.hydrateQueryFromCache({
					key,
					category: category || null,
					search: search || '',
				})
			)
			return null
		}

		return dispatch(fetchQueryPage({ category, search, page: 1 }))
	}
}

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

const INITIAL_QUERY = {
	key: null,
	category: null,
	search: '',
	page: 0,
	limit: 48,
	items: [],
	hasNext: false,
	totalItems: 0,
	status: 'idle',
	error: null,
}

const productsSlice = createSlice({
	name: 'products',
	initialState: {
		items: [],
		status: 'idle',
		error: null,
		pagination: null, // { page, limit, totalItems, totalPages, hasNext, hasPrev }
		searchQuery: '',
		filters: INITIAL_FILTERS,

		// Отдельное состояние для category/search-фильтрованного просмотра —
		// заполняется через fetchQueryPage/loadCatalogQuery, не смешивается
		// с items/pagination выше (те остаются для обычного "все товары"
		// домашнего просмотра с постраничной подгрузкой при скролле).
		query: INITIAL_QUERY,
		queryCache: {}, // key -> { items, page, hasNext, totalItems, limit, updatedAt }
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

		// Мгновенная гидратация query из кэша (см. loadCatalogQuery) — без сети.
		hydrateQueryFromCache(state, action) {
			const { key, category, search } = action.payload
			const cached = state.queryCache[key]
			if (!cached) return

			state.query = {
				key,
				category,
				search,
				page: cached.page,
				limit: cached.limit,
				items: cached.items,
				hasNext: cached.hasNext,
				totalItems: cached.totalItems,
				status: 'succeeded',
				error: null,
			}
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchQueryPage.pending, (state, action) => {
				const { category, search, page = 1 } = action.meta.arg || {}
				const key = makeQueryKey(category, search)

				if (page <= 1 || state.query.key !== key) {
					// Новый ключ (или повторная страница 1) — сбрасываем сразу,
					// чтобы старые результаты предыдущей категории/запроса
					// никогда не "мигнули" на экране поверх новых.
					state.query = {
						...INITIAL_QUERY,
						key,
						category: category || null,
						search: search || '',
						status: 'loading',
					}
				} else {
					state.query.status = 'loading'
				}
			})
			.addCase(fetchQueryPage.fulfilled, (state, action) => {
				const { category, search, page = 1 } = action.meta.arg || {}
				const key = makeQueryKey(category, search)

				// Guard от гонки: пока этот запрос летел, пользователь мог
				// переключиться на другую категорию/запрос — тогда результат
				// уже неактуален и не должен затирать текущее состояние
				// (пример: искали "роза", потом сразу "тюльпан" — ответ на
				// "роза" пришёл позже и должен быть проигнорирован).
				if (state.query.key !== key) return

				const pagination = action.payload.pagination
				const resolvedPage = pagination?.page ?? page

				state.query.status = 'succeeded'
				state.query.error = null
				state.query.page = resolvedPage
				state.query.hasNext = !!pagination?.hasNext
				state.query.totalItems = pagination?.totalItems ?? 0

				if (resolvedPage <= 1) {
					state.query.items = action.payload.items
				} else {
					const known = new Set(state.query.items.map(p => p.id))
					for (const item of action.payload.items) {
						if (!known.has(item.id)) state.query.items.push(item)
					}
				}

				// Write-through в простой in-memory кэш — переключение обратно
				// на недавнюю категорию/запрос не бьёт по сети снова.
				const cacheKeys = Object.keys(state.queryCache)
				if (cacheKeys.length >= QUERY_CACHE_MAX_ENTRIES && !state.queryCache[key]) {
					let oldestKey = cacheKeys[0]
					for (const k of cacheKeys) {
						if (state.queryCache[k].updatedAt < state.queryCache[oldestKey].updatedAt) {
							oldestKey = k
						}
					}
					delete state.queryCache[oldestKey]
				}
				state.queryCache[key] = {
					items: state.query.items,
					page: state.query.page,
					hasNext: state.query.hasNext,
					totalItems: state.query.totalItems,
					limit: state.query.limit,
					updatedAt: Date.now(),
				}
			})
			.addCase(fetchQueryPage.rejected, (state, action) => {
				// Отменённый (abort) запрос — просто игнорируем, это не ошибка,
				// его результат больше никому не нужен.
				if (action.meta.aborted) return

				const { category, search } = action.meta.arg || {}
				const key = makeQueryKey(category, search)
				if (state.query.key !== key) return // тоже устарело — игнор

				state.query.status = 'failed'
				state.query.error = action.payload || action.error?.message || 'Ошибка'
			})
			.addCase(fetchProductsPage.pending, state => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(fetchProductsPage.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.pagination = action.payload.pagination

				// На retry / page=1 начинаем список заново, иначе — доклеиваем
				// следующую страницу (пропуская уже загруженные id).
				if ((action.payload.pagination?.page ?? 1) <= 1) {
					state.items = action.payload.items
				} else {
					const known = new Set(state.items.map(p => p.id))
					for (const item of action.payload.items) {
						if (!known.has(item.id)) state.items.push(item)
					}
				}
			})
			.addCase(fetchProductsPage.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error?.message || 'Ошибка'
			})
			.addCase(fetchProductDetail.fulfilled, (state, action) => {
				const index = state.items.findIndex(p => p.id === action.payload.id)
				if (index === -1) state.items.push(action.payload)
				else state.items[index] = { ...state.items[index], ...action.payload }
			})
	},
})

export const { setSearchQuery, clearSearchQuery, setFilters, resetFilters } =
	productsSlice.actions

/* ===================== Селекторы ===================== */
export const selectFilters = s => s.products.filters
export const selectQueryState = s => s.products.query

export function isDiscountedProduct(p) {
	const d = Number(p?.discountPrice)
	const base = Number(p?.price)
	return Number.isFinite(d) && d > 0 && (!Number.isFinite(base) || d < base)
}

export const selectDiscountedProducts = createSelector(
	[s => s.products.items],
	items => items.filter(isDiscountedProduct)
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
		const hasPriceMax =
			priceMaxRaw !== null && priceMaxRaw !== undefined && priceMaxRaw !== ''
		const priceMax = hasPriceMax ? Number(filters.price.max) : null

		const wantStock = !!filters?.inStockOnly
		const wantCert = !!filters?.hasCertificate

		return items.filter(p => {
			const matchesSearch =
				!q ||
				norm(p.name).includes(q) ||
				norm(p.description).includes(q) ||
				norm(p.category).includes(q) ||
				norm(p.subcategory).includes(q) ||
				norm(p.manufacturer).includes(q)
			if (!matchesSearch) return false

			if (sel && sel !== 'all') {
				const productCat = norm(p.category)
				const productSub = norm(p.subcategory)
				if (!(sel === productSub || sel === productCat)) return false
			}

			const curPrice = getCurrentPrice(p)
			if (Number.isFinite(priceMin) && curPrice < priceMin) return false
			if (hasPriceMax && Number.isFinite(priceMax) && curPrice > priceMax)
				return false

			if (wantStock) {
				const sc = Number(p?.stock)
				if (Number.isFinite(sc) && sc <= 0) return false
			}

			// ВАЖНО: теперь проверяем наличие certificateNumber (а не certificateUrl)
			if (wantCert) {
				const hasNum = !!String(p?.certificateNumber || '').trim()
				if (!hasNum) return false
			}

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
				if (!p?.power || !powerSet.has(p.power)) return false
			}

			return true
		})
	}
)

export default productsSlice.reducer
