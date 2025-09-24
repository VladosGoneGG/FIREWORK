// src/utils/orderApi.js

// Сборка полезной нагрузки для заказа
export function buildOrderPayload(formData, cartState) {
	return {
		user: [
			{
				name: `${formData.firstName} ${formData.lastName}`.trim(),
				phone: formData.phone,
				address:
					formData.delivery === 'delivery' ? formData.address : 'самовывоз',
				email: formData.email || '',
			},
		],
		cart: cartState.items.map(it => ({
			name: it.name,
			quantity: it.quantity,
			price: it.discountPrice ?? it.price, // скидочная или обычная
		})),
	}
}

// Заглушка: имитация отправки на сервер
export async function sendOrder(payload) {
	console.log('[MOCK sendOrder] payload:', JSON.stringify(payload, null, 2))
	// имитируем сетевую задержку
	await new Promise(res => setTimeout(res, 500))
	return { ok: true }
}
