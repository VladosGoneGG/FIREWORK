// src/api/productsApi.js
import axios from 'axios'

// Все пути относительные: в dev их перехватывает Vite-прокси (см. vite.config.js)
// и добавляет Authorization на стороне Node, в проде — это сделает reverse proxy.
// API_KEY в этот файл никогда не попадает.

// Одна страница каталога (карточки для списка/главной) — а не все товары разом.
// category/search/filters — серверная фильтрация (см. catalog.service.js на
// бэкенде) — модалка "фильтр" (цена/тип/производитель/хлопки/мощность/время/
// теги) больше не фильтрует то, что уже подгружено на клиенте, а идёт на
// сервер вместе с category/search; signal — AbortController.signal, чтобы
// отменять устаревший запрос при быстрой смене категории/поиска/фильтров.
export async function getCatalogPage({
	page = 1,
	limit = 48,
	category,
	search,
	filters,
	signal,
} = {}) {
	const params = { page, limit }
	if (category) params.category = category
	if (search) params.search = search

	const f = filters || {}
	if (f.price?.min != null && f.price.min !== '') params.priceMin = f.price.min
	if (f.price?.max != null && f.price.max !== '') params.priceMax = f.price.max
	if (f.time?.min != null && f.time.min !== '') params.timeMin = f.time.min
	if (f.time?.max != null && f.time.max !== '') params.timeMax = f.time.max
	if (Array.isArray(f.types) && f.types.length) params.types = f.types.join(',')
	if (Array.isArray(f.manufacturers) && f.manufacturers.length)
		params.manufacturers = f.manufacturers.join(',')
	if (Array.isArray(f.shots) && f.shots.length) params.shots = f.shots.join(',')
	if (Array.isArray(f.power) && f.power.length) params.power = f.power.join(',')
	if (Array.isArray(f.tags) && f.tags.length) params.tags = f.tags.join(',')

	const { data } = await axios.get('/api/catalog', { params, signal })
	return data
}

// Лёгкий список категорий (не тянет все товары ради 7 названий).
export async function getCategories() {
	const { data } = await axios.get('/api/categories')
	return data
}

// Каталожные значения фильтров (тип товара/производитель/мощность) — по
// всему каталогу разом, не по уже подгруженным на клиенте страницам (см.
// GET /api/v1/catalog/facets на бэкенде).
export async function getCatalogFacets() {
	const { data } = await axios.get('/api/catalog/facets')
	return data
}

// Полная карточка одного товара — подгружается лениво при открытии деталей.
export async function getProductById(id) {
	const { data } = await axios.get(`/api/products/${id}`)
	return data[id]
}
