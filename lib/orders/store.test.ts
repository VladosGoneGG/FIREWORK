import { rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createOrderIfNotExists, getOrder, markNotified, type OrderRecord } from './store'

// Writes real (small, throwaway) files under data/orders/ — that directory
// is gitignored and this is the simplest honest test of a file-based
// store: mocking node:fs would just re-describe the implementation.
// Every test cleans up the specific id it used.
const testIds: string[] = []
afterEach(async () => {
	await Promise.all(
		testIds.splice(0).map(id =>
			rm(path.join(process.cwd(), 'data', 'orders', `${id}.json`), { force: true })
		)
	)
})

function makeOrder(id: string): OrderRecord {
	testIds.push(id)
	return {
		id,
		orderReference: id.slice(0, 8).toUpperCase(),
		createdAt: new Date().toISOString(),
		customer: {
			firstName: 'Иван',
			lastName: 'Тестов',
			phone: '+79991234567',
			birthDate: '15.05.1990',
			delivery: 'pickup',
			address: 'самовывоз',
			email: '',
		},
		lines: [],
		total: 5000,
		notified: false,
	}
}

describe('order store', () => {
	it('returns null for an order that does not exist', async () => {
		expect(await getOrder(crypto.randomUUID())).toBeNull()
	})

	it('round-trips a created order', async () => {
		const order = makeOrder(crypto.randomUUID())
		await createOrderIfNotExists(order)
		expect(await getOrder(order.id)).toEqual(order)
	})

	it('markNotified flips the flag without touching anything else', async () => {
		const order = makeOrder(crypto.randomUUID())
		await createOrderIfNotExists(order)
		await markNotified(order.id)
		const reloaded = await getOrder(order.id)
		expect(reloaded?.notified).toBe(true)
		expect(reloaded?.total).toBe(order.total)
	})

	it('markNotified on an unknown id is a safe no-op', async () => {
		await expect(markNotified(crypto.randomUUID())).resolves.toBeUndefined()
	})

	it('reports created:true the first time, created:false (with the existing record) the second', async () => {
		const order = makeOrder(crypto.randomUUID())
		const first = await createOrderIfNotExists(order)
		expect(first).toEqual({ created: true, order })

		const differentTotal = { ...order, total: 999_999 }
		const second = await createOrderIfNotExists(differentTotal)
		expect(second.created).toBe(false)
		expect(second.order.total).toBe(order.total) // the original record wins, not the second caller's
	})

	it('two concurrent creates for the same id result in exactly one winner', async () => {
		const a = makeOrder(crypto.randomUUID())
		const b = { ...a, total: 1 } // same id, different content — simulates a genuine race
		const [ra, rb] = await Promise.all([createOrderIfNotExists(a), createOrderIfNotExists(b)])
		const createdCount = [ra.created, rb.created].filter(Boolean).length
		expect(createdCount).toBe(1)
		expect(ra.order).toEqual(rb.order) // both callers agree on the same final record
	})
})
