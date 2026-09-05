// src/api/productsApi.js
import axios from 'axios'

// Все пути относительные: в dev их перехватывает Vite-прокси (см. vite.config.js)
// и добавляет Authorization на стороне Node, в проде — это сделает reverse proxy.
// API_KEY в этот файл никогда не попадает.

// Одна страница каталога (карточки для списка/главной) — а не все товары разом.
// category/search — серверная фильтрация (см. catalog.service.js на бэкенде);
// signal — AbortController.signal, чтобы отменять устаревший запрос при
// быстрой смене категории/поискового запроса.
export async function getCatalogPage({
	page = 1,
	limit = 48,
	category,
	search,
	signal,
} = {}) {
	const params = { page, limit }
	if (category) params.category = category
	if (search) params.search = search

	const { data } = await axios.get('/api/catalog', { params, signal })
	return data
}

// Лёгкий список категорий (не тянет все товары ради 7 названий).
export async function getCategories() {
	const { data } = await axios.get('/api/categories')
	return data
}

// Полная карточка одного товара — подгружается лениво при открытии деталей.
export async function getProductById(id) {
	const { data } = await axios.get(`/api/products/${id}`)
	return data[id]
}
