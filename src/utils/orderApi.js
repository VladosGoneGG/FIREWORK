// =============================
// БЕЗОПАСНОСТЬ (см. SECURITY_INCIDENT.md)
// =============================
// Раньше здесь читался токен Telegram-бота из VITE_TELEGRAM_BOT_TOKEN и
// запрос уходил напрямую из браузера. Любая переменная VITE_* попадает в
// клиентский бандл в открытом виде, поэтому секрет утекал каждому
// посетителю. Токен отозван; клиентская отправка удалена без замены.
//
// На статическом Vite-хостинге нет безопасного места для секрета — сервер
// появится только на этапе миграции на Next.js (Server Action, см. P6 в
// отчёте аудита). До тех пор sendOrder() честно сообщает, что реальная
// отправка недоступна, вместо того чтобы притворяться успехом.

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

// Формат сообщения для Telegram — часть бизнес-поведения, сохраняем
// один-в-один для будущего Server Action (см. orders/telegram.ts в P6).
export function formatTelegramMessage(payload) {
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
// Отправка заказа
// =============================
// Пока нет сервера — реальная отправка недоступна. Возвращаем явную ошибку
// с кодом, а не притворяемся успехом (было: C2 в аудите). Вызывающий код
// обязан показать пользователю ошибку и сохранить корзину.
export async function sendOrder() {
	return {
		ok: false,
		code: 'transport_unavailable',
		message:
			'Оформление заказа временно недоступно. Пожалуйста, свяжитесь с нами по телефону.',
	}
}
