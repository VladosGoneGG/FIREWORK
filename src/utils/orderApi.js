import axios from 'axios'
import { postOrder } from '../api/ordersApi'

// =============================
// Конфигурация Telegram бота
// =============================
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || ''

// Приводит российский номер к виду 89000000001 (число, как договорились с бекендом).
function toRuPhoneNumber(phone) {
	const digits = String(phone || '').replace(/\D/g, '')
	const local10 = digits.slice(-10)
	return local10 ? Number('8' + local10) : null
}

// =============================
//  Формирование полезной нагрузки для бекенда
// =============================
export function buildOrderPayload(formData, cartState) {
	const Nomenclatura = {}
	for (const it of cartState.items) {
		Nomenclatura[it.id] = {
			quantity: it.quantity,
			price: it.discountPrice ?? it.unitPrice ?? it.price,
		}
	}

	const methodOfObtaining =
		formData.delivery === 'delivery'
			? `доставка, ${formData.address}`
			: 'самовывоз'

	return {
		Nomenclatura,
		userInfo: {
			name: `${formData.firstName} ${formData.lastName}`.trim(),
			tel: toRuPhoneNumber(formData.phone),
			method_of_obtaining: methodOfObtaining,
			email: formData.email || '',
		},
	}
}

// =============================
// Форматирование сообщения для Telegram
// =============================
function formatTelegramMessage(payload) {
	const { userInfo, Nomenclatura } = payload

	let text = '<b>Новый заказ!</b>\n\n'
	text += '<b>Покупатель:</b>\n'
	text += `• Имя: <b>${userInfo.name || 'не указано'}</b>\n`
	text += `• Телефон: <b>${userInfo.tel}</b>\n`
	text += `• Способ получения: <b>${userInfo.method_of_obtaining}</b>\n`
	text += `• Email: <i>${userInfo.email || 'не указан'}</i>\n\n`

	let total = 0
	text += '<b>Товары:</b>\n'
	Object.entries(Nomenclatura).forEach(([id, line], index) => {
		total += line.price * line.quantity
		text += `${index + 1}. <code>${id}</code> — ${line.quantity} шт. × ${
			line.price
		} ₽\n`
	})

	text += `\n<b>Итого: ${total} ₽</b>`

	return text
}

// =============================
// Отправка в Telegram (best-effort — не блокирует оформление заказа)
// =============================
async function sendToBot(text) {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return

	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
	await axios.post(url, {
		chat_id: TELEGRAM_CHAT_ID,
		text,
		parse_mode: 'HTML',
	})
}

// =============================
// Отправка заказа: сохранение на сервере (основное) + уведомление в Telegram
// =============================
export async function sendOrder(payload) {
	try {
		const result = await postOrder(payload)

		try {
			await sendToBot(formatTelegramMessage(payload))
		} catch (err) {
			console.error('Не удалось отправить уведомление в Telegram:', err)
		}

		return { ok: true, orderId: result?.orderId }
	} catch (err) {
		console.error('Ошибка при отправке заказа:', err)
		return { ok: false, error: err }
	}
}
