// src/store/slices/productsSlice.js
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import {
	getCatalogFacets,
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

// Одна страница каталога, отфильтрованная сервером по category/search/
// advanced-фильтрам ("фильтр" модалка) — используется вместо докачки всего
// каталога при выборе категории, поиске или применении фильтров (см.
// useCatalogFilterQuery). thunkAPI.signal передаётся в axios, поэтому
// dispatch(...).abort() реально отменяет сетевой запрос.
export const fetchQueryPage = createAsyncThunk(
	'products/fetchQueryPage',
	async ({ category, search, filters, page = 1, limit = 48 } = {}, { signal, rejectWithValue }) => {
		try {
			const data = await getCatalogPage({ page, limit, category, search, filters, signal })
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

// Каталожные значения фильтров (тип товара/производитель/мощность) — по
// всему каталогу, а не по state.products.items (см. useFilterOptions).
// Фетчится один раз при загрузке приложения (см. useProductsBoot), как и
// fetchCategories — это статичные-в-рамках-сессии метаданные каталога, а
// не постранично подгружаемые товары, поэтому им не нужна ни пагинация,
// ни query-кэш выше.
export const fetchCatalogFacets = createAsyncThunk(
	'products/fetchCatalogFacets',
	async (_, { rejectWithValue }) => {
		try {
			const data = await getCatalogFacets()
			return {
				types: Array.isArray(data?.types) ? data.types : [],
				manufacturers: Array.isArray(data?.manufacturers) ? data.manufacturers : [],
				power: Array.isArray(data?.power) ? data.power : [],
			}
		} catch (err) {
			return rejectWithValue(
				err?.response?.data?.error || err?.message || 'Ошибка загрузки фильтров'
			)
		}
	}
)

const QUERY_CACHE_TTL_MS = 2 * 60 * 1000
const QUERY_CACHE_MAX_ENTRIES = 8

// Стабильная (сортированная) сериализация формы фильтров — порядок, в
// котором пользователь щёлкал чекбоксы, не должен создавать "новый" ключ
// кэша/запроса для того же самого набора значений. Пустые поля опускаются:
// {} и отсутствие фильтров дают одинаковый ключ.
export function serializeFilters(filters) {
	const f = filters || {}
	const out = {}

	const arr = (v, mapFn = x => x) =>
		Array.isArray(v) && v.length ? [...v].map(mapFn).sort() : null

	const types = arr(f.types, s => String(s).trim().toLowerCase())
	const manufacturers = arr(f.manufacturers, s => String(s).trim().toLowerCase())
	const shots = arr(f.shots, n => Number(n))?.sort((a, b) => a - b)
	const power = arr(f.power, s => String(s).trim().toLowerCase())
	const tags = arr(f.tags, s => String(s).trim().toLowerCase())

	if (types) out.types = types
	if (manufacturers) out.manufacturers = manufacturers
	if (shots) out.shots = shots
	if (power) out.power = power
	if (tags) out.tags = tags

	if (f.price && (f.price.min != null && f.price.min !== '')) out.priceMin = Number(f.price.min)
	if (f.price && (f.price.max != null && f.price.max !== '')) out.priceMax = Number(f.price.max)
	if (f.time && (f.time.min != null && f.time.min !== '')) out.timeMin = Number(f.time.min)
	if (f.time && (f.time.max != null && f.time.max !== '')) out.timeMax = Number(f.time.max)

	return out
}

export function hasActiveFilters(filters) {
	return Object.keys(serializeFilters(filters)).length > 0
}

export function makeQueryKey(category, search, filters) {
	const c = String(category || '').trim().toLowerCase()
	const s = String(search || '').trim().toLowerCase()
	const f = JSON.stringify(serializeFilters(filters))
	return `${c}|${s}|${f}`
}

// Не createAsyncThunk: сначала проверяет лёгкий in-memory кэш (переключение
// обратно на недавно открытую категорию/запрос/набор фильтров — без сети), и
// только если кэша нет или он устарел — реально идёт в API. Возвращает то,
// что вернул dispatch(fetchQueryPage(...)) (со свойством .abort()) либо
// null, если обошлись кэшем — вызывающая сторона может это использовать для
// отмены предыдущего запроса при быстрой смене категории/поиска/фильтров.
export function loadCatalogQuery({ category, search, filters } = {}) {
	return (dispatch, getState) => {
		const key = makeQueryKey(category, search, filters)
		const cached = getState().products.queryCache[key]
		const isFresh = cached && Date.now() - cached.updatedAt < QUERY_CACHE_TTL_MS

		if (isFresh) {
			dispatch(
				productsSlice.actions.hydrateQueryFromCache({
					key,
					category: category || null,
					search: search || '',
					filters: filters || null,
				})
			)
			return null
		}

		return dispatch(fetchQueryPage({ category, search, filters, page: 1 }))
	}
}

// ================== State ==================
const INITIAL_QUERY = {
	key: null,
	category: null,
	search: '',
	filters: null,
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

		// Отдельное состояние для category/search/advanced-filters-
		// отфильтрованного просмотра — заполняется через
		// fetchQueryPage/loadCatalogQuery, не смешивается с items/pagination
		// выше (те остаются для обычного "все товары" домашнего просмотра с
		// постраничной подгрузкой при скролле, без фильтров).
		query: INITIAL_QUERY,
		queryCache: {}, // key -> { items, page, hasNext, totalItems, limit, updatedAt }

		// Каталожные значения фильтров (тип товара/производитель/мощность) —
		// по всему каталогу, не зависят от того, сколько страниц уже
		// подгружено в items (см. useFilterOptions/fetchCatalogFacets).
		facets: {
			types: [],
			manufacturers: [],
			power: [],
			status: 'idle',
			error: null,
		},
	},
	reducers: {
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload
		},
		clearSearchQuery(state) {
			state.searchQuery = ''
		},

		// Мгновенная гидратация query из кэша (см. loadCatalogQuery) — без сети.
		hydrateQueryFromCache(state, action) {
			const { key, category, search, filters } = action.payload
			const cached = state.queryCache[key]
			if (!cached) return

			state.query = {
				key,
				category,
				search,
				filters: filters || null,
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
				const { category, search, filters, page = 1 } = action.meta.arg || {}
				const key = makeQueryKey(category, search, filters)

				if (page <= 1 || state.query.key !== key) {
					// Новый ключ (или повторная страница 1) — сбрасываем сразу,
					// чтобы старые результаты предыдущей категории/запроса/
					// набора фильтров никогда не "мигнули" на экране поверх новых.
					state.query = {
						...INITIAL_QUERY,
						key,
						category: category || null,
						search: search || '',
						filters: filters || null,
						status: 'loading',
					}
				} else {
					state.query.status = 'loading'
				}
			})
			.addCase(fetchQueryPage.fulfilled, (state, action) => {
				const { category, search, filters, page = 1 } = action.meta.arg || {}
				const key = makeQueryKey(category, search, filters)

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

				const { category, search, filters } = action.meta.arg || {}
				const key = makeQueryKey(category, search, filters)
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
			.addCase(fetchCatalogFacets.pending, state => {
				state.facets.status = 'loading'
				state.facets.error = null
			})
			.addCase(fetchCatalogFacets.fulfilled, (state, action) => {
				state.facets.status = 'succeeded'
				state.facets.types = action.payload.types
				state.facets.manufacturers = action.payload.manufacturers
				state.facets.power = action.payload.power
			})
			.addCase(fetchCatalogFacets.rejected, (state, action) => {
				// Не блокирует обычный просмотр каталога — просто чекбоксы
				// "тип товара"/"производитель"/"мощность" останутся пустыми
				// до следующей попытки; items/query это никак не затрагивает.
				state.facets.status = 'failed'
				state.facets.error = action.payload || action.error?.message || 'Ошибка'
			})
	},
})

export const { setSearchQuery, clearSearchQuery } = productsSlice.actions

/* ===================== Селекторы ===================== */
export const selectQueryState = s => s.products.query
export const selectCatalogFacets = s => s.products.facets

export function isDiscountedProduct(p) {
	const d = Number(p?.discountPrice)
	const base = Number(p?.price)
	return Number.isFinite(d) && d > 0 && (!Number.isFinite(base) || d < base)
}

export const selectDiscountedProducts = createSelector(
	[s => s.products.items],
	items => items.filter(isDiscountedProduct)
)

export default productsSlice.reducer
