import axios from 'axios'

// =============================
//  Формирование полезной нагрузки
// =============================
export function buildOrderPayload(formData, cartState) {
	const items = cartState.items.map(it => ({
		name: it.name,
		quantity: it.quantity,
		price: it.discountPrice ?? it.price,
	}))

	// сумма
	const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

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
		cart: items,
		total,
	}
}

// =============================
// Отправка в Telegram
// =============================
async function sendToBot(text) {
	const url = `https://api.telegram.org/bot${'8335753960:AAFSHTdziQsR9nLy7wHv_jFG1oyl8YqN6_c'}/sendMessage`

	return axios.post(url, {
		chat_id: -5010780518,
		text,
		parse_mode: 'HTML',
	})
}

// =============================
// Отправка заказа: на сервер + Telegram
// =============================
export async function sendOrder(payload) {
	try {
		// === Форматируем текст для Telegram ===
		const u = payload.user[0]

		let text = `<b>Новый заказ!</b>\n\n`
		text += `<b>Покупатель:</b>\n`
		text += `• Имя: <b>${u.name || 'не указано'}</b>\n`
		text += `• Телефон: <b>${u.phone}</b>\n`
		text += `• Способ получения: <b>${u.address}</b>\n`
		text += `• Email: <i>${u.email || 'не указан'}</i>\n\n`

		text += `<b>Товары:</b>\n`

		payload.cart.forEach((it, i) => {
			text += `${i + 1}. <b>${it.name}</b> — ${it.quantity} шт. × ${
				it.price
			} ₽\n`
		})

		text += `\n<b>Итого: ${payload.total} ₽</b>`

		// === Отправляем в Telegram ===
		await sendToBot(text)

		// (Если будет свой бекенд — сюда ставишь POST на сервер)
		await new Promise(res => setTimeout(res, 350))

		return { ok: true }
	} catch (err) {
		console.error('Ошибка при отправке заказа:', err)
		return { ok: false, error: err }
	}
}
