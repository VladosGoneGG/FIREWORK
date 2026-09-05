// src/api/ordersApi.js
import axios from 'axios'

// Относительный путь: в dev его перехватывает Vite-прокси и добавляет
// Authorization на стороне Node (см. api/productsApi.js), в проде — reverse proxy.
export async function postOrder(order) {
	const { data } = await axios.post('/api/orders', order)
	return data
}
