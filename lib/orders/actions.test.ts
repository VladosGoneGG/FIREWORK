import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderRecord } from './store'

// In-memory fakes for the store and Telegram transport — submitOrder's own
// orchestration logic is what this file tests (validation, pricing
// authority, idempotency, when persistence vs. notification happens).
// The store and transport get their own separate tests; real disk/network
// access has no place here.
const fakeStore = new Map<string, OrderRecord>()
// No `await` between the check and the set, matching the real store's
// atomic 'wx'-flag write — this is what makes the fake correctly model
// "whichever call's synchronous body runs first wins" under Promise.all,
// the same guarantee the real filesystem gives via EEXIST.
const createOrderMock = vi.fn((order: OrderRecord) => {
	if (fakeStore.has(order.id)) {
		return Promise.resolve({ created: false, order: fakeStore.get(order.id)! })
	}
	fakeStore.set(order.id, order)
	return Promise.resolve({ created: true, order })
})
const getOrderMock = vi.fn(async (id: string) => fakeStore.get(id) ?? null)
const markNotifiedMock = vi.fn(async (id: string) => {
	const order = fakeStore.get(id)
	if (order) order.notified = true
})
const sendTelegramNotificationMock = vi.fn(
	async (_text: string): Promise<{ ok: boolean; error?: string }> => ({ ok: true })
)

vi.mock('./store', () => ({
	createOrderIfNotExists: (...args: [OrderRecord]) => createOrderMock(...args),
	getOrder: (...args: [string]) => getOrderMock(...args),
	markNotified: (...args: [string]) => markNotifiedMock(...args),
}))
vi.mock('./telegram', () => ({
	sendTelegramNotification: (...args: [string]) => sendTelegramNotificationMock(...args),
}))

const { submitOrder } = await import('./actions')
const { getProducts } = await import('@/lib/catalogue')
const { MIN_ORDER_AMOUNT } = await import('@/lib/cart/schema')

beforeEach(() => {
	fakeStore.clear()
	createOrderMock.mockClear()
	getOrderMock.mockClear()
	markNotifiedMock.mockClear()
	sendTelegramNotificationMock.mockClear()
	sendTelegramNotificationMock.mockResolvedValue({ ok: true })
})

// Enough of a real cart to clear the ₽4,800 minimum, built from the actual
// (deterministic) catalogue rather than hand-picked prices that could
// drift if the fixture changes.
async function enoughItems() {
	const products = await getProducts()
	const items: { productId: number; quantity: number }[] = []
	let total = 0
	for (const p of products) {
		if (total >= MIN_ORDER_AMOUNT) break
		items.push({ productId: p.id, quantity: 1 })
		total += p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price
	}
	return items
}

const validFields = {
	phone: '9991234567',
	lastName: 'Тестов',
	firstName: 'Иван',
	birthDate: '15.05.1990',
	delivery: 'pickup' as const,
	address: '',
}

describe('submitOrder — valid order', () => {
	it('persists, notifies, and returns a stable order reference', async () => {
		const items = await enoughItems()
		const result = await submitOrder({
			...validFields,
			items,
			idempotencyKey: crypto.randomUUID(),
		})

		expect(result.ok).toBe(true)
		if (!result.ok) throw new Error('expected ok:true')
		expect(result.orderId).toBeTruthy()
		expect(result.orderReference).toHaveLength(8)
		expect(createOrderMock).toHaveBeenCalledTimes(1)
		expect(sendTelegramNotificationMock).toHaveBeenCalledTimes(1)
		expect(markNotifiedMock).toHaveBeenCalledTimes(1)
	})
})

describe('submitOrder — business-rule validation (server-side, regardless of client)', () => {
	it('rejects under-16', async () => {
		const today = new Date()
		const age15 = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear() - 15}`
		const result = await submitOrder({
			...validFields,
			birthDate: age15,
			items: await enoughItems(),
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.fieldErrors?.birthDate).toBe('только 16+')
		expect(createOrderMock).not.toHaveBeenCalled()
	})

	it('rejects an impossible birth date', async () => {
		const result = await submitOrder({
			...validFields,
			birthDate: '31.02.2000',
			items: await enoughItems(),
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.fieldErrors?.birthDate).toBe('некорректная дата')
	})

	it('rejects malformed input (garbage shape) without throwing', async () => {
		const result = await submitOrder({ not: 'a valid order at all' })
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.code).toBe('validation_error')
		expect(createOrderMock).not.toHaveBeenCalled()
	})

	it('rejects a missing required field (lastName)', async () => {
		const result = await submitOrder({
			...validFields,
			lastName: '',
			items: await enoughItems(),
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.fieldErrors?.lastName).toBeTruthy()
	})

	it('rejects delivery without an address', async () => {
		const result = await submitOrder({
			...validFields,
			delivery: 'delivery',
			address: '',
			items: await enoughItems(),
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.fieldErrors?.address).toBe('укажите адрес')
	})

	it('rejects an invalid/unknown product id', async () => {
		const result = await submitOrder({
			...validFields,
			items: [{ productId: 999_999_999, quantity: 1 }],
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.code).toBe('unavailable_items')
		expect(createOrderMock).not.toHaveBeenCalled()
	})

	it('rejects insufficient stock', async () => {
		const products = await getProducts()
		const product = products[0]
		const result = await submitOrder({
			...validFields,
			items: [{ productId: product.id, quantity: product.stock + 1000 }],
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.code).toBe('unavailable_items')
		expect(result.message).toContain(product.name)
	})

	it('rejects a total below the ₽4,800 minimum', async () => {
		const products = await getProducts()
		const cheapest = [...products].sort((a, b) => a.price - b.price)[0]
		const result = await submitOrder({
			...validFields,
			items: [{ productId: cheapest.id, quantity: 1 }],
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.code).toBe('below_minimum')
	})
})

describe('submitOrder — price/total authority cannot be manipulated by the client', () => {
	it('ignores a client-supplied price/total/discount and computes its own from the catalogue', async () => {
		const items = await enoughItems()
		// The schema has no field for price/total/discount at all — passing
		// them proves they're silently stripped, not "validated away".
		const result = await submitOrder({
			...validFields,
			items,
			idempotencyKey: crypto.randomUUID(),
			price: 1,
			total: 1,
			discountPrice: 999999,
		})
		expect(result.ok).toBe(true)
		expect(createOrderMock).toHaveBeenCalledTimes(1)
		const persisted = createOrderMock.mock.calls[0][0] as OrderRecord
		expect(persisted.total).toBeGreaterThanOrEqual(MIN_ORDER_AMOUNT)
		expect(persisted.total).not.toBe(1)
	})

	it('a manipulated quantity still resolves to the server-computed line total, not a client one', async () => {
		const filler = await enoughItems() // clears the ₽4,800 minimum on its own
		const fillerIds = new Set(filler.map(i => i.productId))
		const products = await getProducts()
		const product = products.find(p => p.stock >= 3 && !fillerIds.has(p.id))!

		await submitOrder({
			...validFields,
			items: filler.concat([{ productId: product.id, quantity: 3 }]),
			idempotencyKey: crypto.randomUUID(),
		})
		const persisted = createOrderMock.mock.calls[0][0] as OrderRecord
		const line = persisted.lines.find(l => l.productId === product.id)!
		expect(line.lineTotal).toBe(line.unitPrice * 3)
	})
})

describe('submitOrder — Telegram / persistence failure handling', () => {
	it('on Telegram failure: order persists, result is ok:false with the orderId, not fake success', async () => {
		sendTelegramNotificationMock.mockResolvedValueOnce({ ok: false, error: 'network_error' })
		const result = await submitOrder({
			...validFields,
			items: await enoughItems(),
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.code).toBe('notification_failed')
		expect(result.orderId).toBeTruthy()
		expect(createOrderMock).toHaveBeenCalledTimes(1) // order was NOT lost
		expect(markNotifiedMock).not.toHaveBeenCalled()
	})

	it('on a persistence failure, the order is never created and Telegram is never contacted', async () => {
		createOrderMock.mockRejectedValueOnce(new Error('disk full'))
		const result = await submitOrder({
			...validFields,
			items: await enoughItems(),
			idempotencyKey: crypto.randomUUID(),
		})
		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected ok:false')
		expect(result.code).toBe('persist_failed')
		expect(sendTelegramNotificationMock).not.toHaveBeenCalled()
	})
})

describe('submitOrder — idempotency', () => {
	it('a repeated submission with the same idempotency key does not create a second order', async () => {
		const items = await enoughItems()
		const idempotencyKey = crypto.randomUUID()
		const first = await submitOrder({ ...validFields, items, idempotencyKey })
		const second = await submitOrder({ ...validFields, items, idempotencyKey })

		expect(first.ok).toBe(true)
		expect(second.ok).toBe(true)
		if (!first.ok || !second.ok) throw new Error('expected both ok:true')
		expect(second.orderId).toBe(first.orderId)
		expect(createOrderMock).toHaveBeenCalledTimes(1)
		expect(sendTelegramNotificationMock).toHaveBeenCalledTimes(1) // not re-sent once notified
	})

	it('simulated double-click (two concurrent calls, same key) still creates exactly one order', async () => {
		// Genuine concurrency, not a sequential retry: both calls reach the
		// idempotency check before either has finished creating the order —
		// exactly the race a naive "check then write" would lose. The
		// atomic store call (createOrderIfNotExists) is invoked by both, but
		// only one actually creates a record; the loser is told to retry
		// rather than silently producing a second order.
		const items = await enoughItems()
		const idempotencyKey = crypto.randomUUID()
		const [a, b] = await Promise.all([
			submitOrder({ ...validFields, items, idempotencyKey }),
			submitOrder({ ...validFields, items, idempotencyKey }),
		])

		const results = [a, b]
		expect(results.filter(r => r.ok)).toHaveLength(1)
		expect(fakeStore.size).toBe(1) // exactly one order record exists
		expect(sendTelegramNotificationMock).toHaveBeenCalledTimes(1) // exactly one notification sent
	})

	it('retrying after a notification failure re-sends the notification but does not re-persist', async () => {
		const items = await enoughItems()
		const idempotencyKey = crypto.randomUUID()

		sendTelegramNotificationMock.mockResolvedValueOnce({ ok: false, error: 'network_error' })
		const first = await submitOrder({ ...validFields, items, idempotencyKey })
		expect(first.ok).toBe(false)

		sendTelegramNotificationMock.mockResolvedValueOnce({ ok: true })
		const retry = await submitOrder({ ...validFields, items, idempotencyKey })
		expect(retry.ok).toBe(true)

		expect(createOrderMock).toHaveBeenCalledTimes(1) // still just the one order
		expect(sendTelegramNotificationMock).toHaveBeenCalledTimes(2) // failed once, retried once
		expect(markNotifiedMock).toHaveBeenCalledTimes(1)
	})

	it('a different idempotency key is a genuinely new order', async () => {
		const items = await enoughItems()
		await submitOrder({ ...validFields, items, idempotencyKey: crypto.randomUUID() })
		await submitOrder({ ...validFields, items, idempotencyKey: crypto.randomUUID() })
		expect(createOrderMock).toHaveBeenCalledTimes(2)
	})
})
