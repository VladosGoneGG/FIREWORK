// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const submitOrder = vi.fn()
vi.mock('@/lib/orders/actions', () => ({
	submitOrder: (...args: unknown[]) => submitOrder(...args),
}))

const { default: CheckoutForm } = await import('./CheckoutForm')

const items = [{ productId: 1, quantity: 1 }]

function fillValidFields() {
	const setNative = (el: HTMLInputElement, value: string) => {
		const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
		setter.call(el, value)
		el.dispatchEvent(new Event('input', { bubbles: true }))
	}
	setNative(screen.getByLabelText('Телефон'), '9991234567')
	setNative(screen.getByLabelText('Фамилия'), 'Тестов')
	setNative(screen.getByLabelText('Имя'), 'Иван')
	setNative(screen.getByLabelText('Дата рождения (ДД.ММ.ГГГГ)'), '15.05.1990')
}

beforeEach(() => {
	submitOrder.mockReset()
})

describe('CheckoutForm', () => {
	it('on success, calls onConfirmed with the order reference (cart-clearing is the caller\'s job)', async () => {
		submitOrder.mockResolvedValue({ ok: true, orderId: 'abc-123', orderReference: 'ABC123EF' })
		const onConfirmed = vi.fn()
		render(<CheckoutForm items={items} onConfirmed={onConfirmed} />)

		fillValidFields()
		await act(async () => screen.getByRole('button', { name: 'оформить заказ' }).click())

		expect(onConfirmed).toHaveBeenCalledWith({ orderId: 'abc-123', orderReference: 'ABC123EF' })
	})

	it('on failure, does NOT call onConfirmed — the caller (CartDrawer) never clears the cart', async () => {
		submitOrder.mockResolvedValue({
			ok: false,
			code: 'notification_failed',
			message: 'Заказ сохранён, но магазин пока не удалось уведомить.',
		})
		const onConfirmed = vi.fn()
		render(<CheckoutForm items={items} onConfirmed={onConfirmed} />)

		fillValidFields()
		await act(async () => screen.getByRole('button', { name: 'оформить заказ' }).click())

		expect(onConfirmed).not.toHaveBeenCalled()
		expect(await screen.findByRole('alert')).toBeTruthy()
		expect(screen.getByRole('alert').textContent).toContain('не удалось уведомить')
	})

	it('does not submit at all when a required field is empty (client-side gate before the server is ever called)', async () => {
		const onConfirmed = vi.fn()
		render(<CheckoutForm items={items} onConfirmed={onConfirmed} />)
		// leave every field empty
		await act(async () => screen.getByRole('button', { name: 'оформить заказ' }).click())

		expect(submitOrder).not.toHaveBeenCalled()
		expect(onConfirmed).not.toHaveBeenCalled()
	})

	it('sends the same idempotencyKey on a retry after failure, not a new one', async () => {
		submitOrder.mockResolvedValue({ ok: false, code: 'notification_failed', message: 'нет связи' })
		render(<CheckoutForm items={items} onConfirmed={vi.fn()} />)

		fillValidFields()
		await act(async () => screen.getByRole('button', { name: 'оформить заказ' }).click())
		await act(async () => screen.getByRole('button', { name: 'повторить' }).click())

		expect(submitOrder).toHaveBeenCalledTimes(2)
		const firstKey = submitOrder.mock.calls[0][0].idempotencyKey
		const secondKey = submitOrder.mock.calls[1][0].idempotencyKey
		expect(secondKey).toBe(firstKey)
	})

	it('sends items as {productId, quantity} only — never a price/total field', async () => {
		submitOrder.mockResolvedValue({ ok: true, orderId: 'x', orderReference: 'X' })
		render(<CheckoutForm items={items} onConfirmed={vi.fn()} />)
		fillValidFields()
		await act(async () => screen.getByRole('button', { name: 'оформить заказ' }).click())

		const payload = submitOrder.mock.calls[0][0]
		expect(payload.items).toEqual(items)
		expect(payload).not.toHaveProperty('total')
		expect(payload).not.toHaveProperty('price')
	})
})
