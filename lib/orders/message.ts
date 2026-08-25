import type { ResolvedCartLine } from '@/lib/cart/pricing'

export interface OrderNotificationInput {
	name: string
	phone: string
	address: string // "самовывоз" for pickup, the real address for delivery
	email: string
	lines: ResolvedCartLine[]
	total: number
	orderReference: string
}

// Message format ported unchanged from the old app's orderApi.js
// (formatTelegramMessage) — this is a business behavior (what the shop's
// staff actually see and act on), not implementation detail, so it's kept
// compatible rather than "improved". Only addition: the order reference,
// since the old app never had persisted orders to reference.
export function formatOrderNotification(input: OrderNotificationInput): string {
	let text = '<b>Новый заказ!</b>\n\n'
	text += `<b>№ ${input.orderReference}</b>\n\n`
	text += '<b>Покупатель:</b>\n'
	text += `• Имя: <b>${input.name || 'не указано'}</b>\n`
	text += `• Телефон: <b>${input.phone}</b>\n`
	text += `• Способ получения: <b>${input.address}</b>\n`
	text += `• Email: <i>${input.email || 'не указан'}</i>\n\n`

	text += '<b>Товары:</b>\n'
	input.lines.forEach((line, index) => {
		text += `${index + 1}. <b>${line.name}</b> — ${line.quantity} шт. × ${line.unitPrice} ₽\n`
	})

	text += `\n<b>Итого: ${input.total} ₽</b>`

	return text
}
