import 'server-only'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { ResolvedCartLine } from '@/lib/cart/pricing'

export interface OrderRecord {
	id: string // = the client's idempotency key — see lib/orders/schema.ts
	orderReference: string // short, customer-facing
	createdAt: string
	customer: {
		firstName: string
		lastName: string
		phone: string
		birthDate: string
		delivery: 'pickup' | 'delivery'
		address: string
		email: string
	}
	lines: ResolvedCartLine[]
	total: number
	notified: boolean
}

// File-based persistence: one JSON file per order, keyed by id. This is
// the "simple local/server-side implementation" the order repository is
// explicitly allowed to be for now — no real database or 1C integration
// exists yet. What matters is the boundary: every caller goes through
// getOrder/createOrder/markNotified below, never touches the filesystem
// directly, so swapping this file for a real database later changes
// nothing about lib/orders/actions.ts or the checkout UI. One file per
// order (rather than one shared array file) avoids a read-modify-write
// race between concurrent submissions — the failure mode a real database
// would handle with transactions, and the reason this approach doesn't
// scale past a single-process deployment. Telegram remains a notification
// transport on top of this, never the source of truth (see
// lib/orders/telegram.ts) — an order exists here whether or not the
// notification ever succeeds.

const ORDERS_DIR = path.join(process.cwd(), 'data', 'orders')

function filePathFor(id: string): string {
	// id is always a server-validated UUID (checkoutInputSchema) before it
	// ever reaches here — safe to use directly as a filename.
	return path.join(ORDERS_DIR, `${id}.json`)
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
	try {
		const raw = await readFile(filePathFor(id), 'utf-8')
		return JSON.parse(raw) as OrderRecord
	} catch {
		return null
	}
}

/**
 * Atomically creates the order unless one with this id already exists —
 * `created: false` means a concurrent request (e.g. a genuine double-click
 * that produced two near-simultaneous requests) won the race, and
 * `order` is *its* record, not this call's input. This closes the actual
 * race a plain "check then write" would have: two concurrent calls can
 * both see "nothing exists yet" before either finishes writing. The 'wx'
 * flag makes the filesystem itself the arbiter — the second writer's
 * open() fails with EEXIST — rather than coordinating in application code.
 */
export async function createOrderIfNotExists(
	order: OrderRecord
): Promise<{ created: boolean; order: OrderRecord }> {
	await mkdir(ORDERS_DIR, { recursive: true })
	try {
		await writeFile(filePathFor(order.id), JSON.stringify(order, null, 2), {
			encoding: 'utf-8',
			flag: 'wx',
		})
		return { created: true, order }
	} catch (err) {
		if ((err as NodeJS.ErrnoException)?.code === 'EEXIST') {
			const existing = await getOrder(order.id)
			if (existing) return { created: false, order: existing }
		}
		throw err
	}
}

export async function markNotified(id: string): Promise<void> {
	const order = await getOrder(id)
	if (!order) return
	order.notified = true
	await writeFile(filePathFor(id), JSON.stringify(order, null, 2), 'utf-8')
}
