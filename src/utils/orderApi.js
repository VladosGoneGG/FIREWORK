import axios from 'axios'

// =============================
// Конфигурация Telegram бота
// =============================
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || ''

// =============================
//  Формирование полезной нагрузки
// =============================
export function buildOrderPayload(formData, cartState) {
	const items = cartState.items.map(it => ({
		name: it.name,
		quantity: it.quantity,
		price: it.discountPrice ?? it.price,
	}))

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
// Форматирование сообщения для Telegram
// =============================
function formatTelegramMessage(payload) {
	const user = payload.user[0]

	let text = '<b>Новый заказ!</b>\n\n'
	text += '<b>Покупатель:</b>\n'
	text += `• Имя: <b>${user.name || 'не указано'}</b>\n`
	text += `• Телефон: <b>${user.phone}</b>\n`
	text += `• Способ получения: <b>${user.address}</b>\n`
	text += `• Email: <i>${user.email || 'не указан'}</i>\n\n`

	text += '<b>Товары:</b>\n'
	payload.cart.forEach((item, index) => {
		text += `${index + 1}. <b>${item.name}</b> — ${item.quantity} шт. × ${
			item.price
		} ₽\n`
	})

	text += `\n<b>Итого: ${payload.total} ₽</b>`

	return text
}

// =============================
// Отправка в Telegram
// =============================
async function sendToBot(text) {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
		throw new Error('Telegram bot configuration is missing')
	}

	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

	return axios.post(url, {
		chat_id: TELEGRAM_CHAT_ID,
		text,
		parse_mode: 'HTML',
	})
}

// =============================
// Отправка заказа: на сервер + Telegram
// =============================
export async function sendOrder(payload) {
	try {
		const text = formatTelegramMessage(payload)
		await sendToBot(text)

		// Имитация задержки для будущей интеграции с бекендом
		await new Promise(resolve => setTimeout(resolve, 350))

		return { ok: true }
	} catch (err) {
		console.error('Ошибка при отправке заказа:', err)
		return { ok: false, error: err }
	}
}
