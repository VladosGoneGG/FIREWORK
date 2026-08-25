import { describe, expect, it } from 'vitest'
import { buildOrderPayload, formatTelegramMessage, sendOrder } from './orderApi'

const cartState = {
	items: [
		{ id: 1, name: 'Салют «Малый калибр»', quantity: 2, price: 590, discountPrice: 385 },
		{ id: 2, name: 'Бенгальская свеча 25 см', quantity: 1, price: 250, discountPrice: null },
	],
	total: 1020,
}

const formData = {
	firstName: 'Иван',
	lastName: 'Тестов',
	phone: '+79991234567',
	delivery: 'pickup',
	address: '',
	email: '',
}

describe('sendOrder (C2 regression)', () => {
	it('never reports success — there is no server-side transport yet', async () => {
		const payload = buildOrderPayload(formData, cartState)
		const result = await sendOrder(payload)

		expect(result.ok).toBe(false)
		expect(result.code).toBe('transport_unavailable')
		expect(typeof result.message).toBe('string')
		expect(result.message.length).toBeGreaterThan(0)
	})
})

describe('buildOrderPayload / formatTelegramMessage (business-rule contract)', () => {
	it('prefers discountPrice over price per line item', () => {
		const payload = buildOrderPayload(formData, cartState)
		expect(payload.cart[0].price).toBe(385) // discounted
		expect(payload.cart[1].price).toBe(250) // no discount, falls back to price
	})

	it('computes total as the sum of line totals', () => {
		const payload = buildOrderPayload(formData, cartState)
		expect(payload.total).toBe(385 * 2 + 250 * 1)
	})

	it('reports "самовывоз" for pickup delivery', () => {
		const payload = buildOrderPayload(formData, cartState)
		expect(payload.user[0].address).toBe('самовывоз')
	})

	it('uses the actual address for delivery', () => {
		const payload = buildOrderPayload(
			{ ...formData, delivery: 'delivery', address: 'ул. Ленина 1' },
			cartState
		)
		expect(payload.user[0].address).toBe('ул. Ленина 1')
	})

	it('renders a Telegram message containing customer and totals', () => {
		const payload = buildOrderPayload(formData, cartState)
		const text = formatTelegramMessage(payload)

		expect(text).toContain('Тестов')
		expect(text).toContain(payload.user[0].phone)
		expect(text).toContain(String(payload.total))
	})
})
