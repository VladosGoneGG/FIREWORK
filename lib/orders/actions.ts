'use server'

import { resolveCart } from '@/lib/cart/pricing'
import { MIN_ORDER_AMOUNT } from '@/lib/cart/schema'
import { formatOrderNotification } from './message'
import { normalizeRuPhoneE164 } from './phone'
import { checkoutInputSchema, type SubmitOrderResult } from './schema'
import { createOrderIfNotExists, getOrder, markNotified, type OrderRecord } from './store'
import { sendTelegramNotification } from './telegram'

function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
	const fieldErrors: Record<string, string> = {}
	for (const issue of error.issues) {
		const key = issue.path[0]
		if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
	}
	return fieldErrors
}

async function attemptNotify(order: OrderRecord): Promise<SubmitOrderResult> {
	const text = formatOrderNotification({
		name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
		phone: order.customer.phone,
		address: order.customer.address,
		email: order.customer.email,
		lines: order.lines,
		total: order.total,
		orderReference: order.orderReference,
	})
	const result = await sendTelegramNotification(text)
	if (result.ok) {
		await markNotified(order.id)
		return { ok: true, orderId: order.id, orderReference: order.orderReference }
	}
	return {
		ok: false,
		code: 'notification_failed',
		message: 'Заказ сохранён, но магазин пока не удалось уведомить. Попробуйте ещё раз или позвоните нам.',
		orderId: order.id,
	}
}

/**
 * The order pipeline, in order:
 * schema validation (business rules: age, dates, required fields, phone,
 * delivery address) -> idempotency check -> resolve authoritative pricing
 * from the catalogue (never the client) -> minimum order / stock checks
 * -> persist atomically -> notify Telegram (best-effort, never blocks the
 * order existing) -> return a result.
 *
 * ok:true only when the order is both persisted AND the shop was
 * notified. A persisted-but-not-notified order still exists and is safe
 * to retry (idempotencyKey), but the customer sees a failure state, not a
 * fake success — see SubmitOrderResult's docs in ./schema.ts.
 */
export async function submitOrder(rawInput: unknown): Promise<SubmitOrderResult> {
	const parsed = checkoutInputSchema.safeParse(rawInput)
	if (!parsed.success) {
		return {
			ok: false,
			code: 'validation_error',
			message: 'Проверьте правильность заполнения формы',
			fieldErrors: fieldErrorsFrom(parsed.error),
		}
	}
	const input = parsed.data

	// Fast path: a resubmission with the same key where the order is
	// already fully confirmed, or exists but still needs notifying — skips
	// re-resolving pricing and re-validating a request that already
	// succeeded (or partially did) once.
	const existing = await getOrder(input.idempotencyKey)
	if (existing) {
		if (existing.notified) {
			return { ok: true, orderId: existing.id, orderReference: existing.orderReference }
		}
		return attemptNotify(existing)
	}

	// Authoritative pricing — the client sent {productId, quantity} only;
	// price/discount/total are computed here from the catalogue, never
	// accepted from input. A manipulated client total is structurally
	// impossible, not just rejected: there is no field for it in the schema.
	const resolved = await resolveCart(input.items)

	if (resolved.removedProductIds.length > 0) {
		return {
			ok: false,
			code: 'unavailable_items',
			message: 'Некоторые товары в корзине больше недоступны. Обновите корзину и попробуйте снова.',
		}
	}

	const insufficientStock = resolved.lines.filter(line => line.quantity > line.stock)
	if (insufficientStock.length > 0) {
		return {
			ok: false,
			code: 'unavailable_items',
			message: `Недостаточно на складе: ${insufficientStock.map(l => l.name).join(', ')}`,
		}
	}

	if (resolved.total < MIN_ORDER_AMOUNT) {
		return {
			ok: false,
			code: 'below_minimum',
			message: `Минимальная сумма заказа — ${MIN_ORDER_AMOUNT} ₽`,
		}
	}

	const phoneE164 = normalizeRuPhoneE164(input.phone)
	// Schema's superRefine already rejected an unnormalizable phone, so this
	// is unreachable in practice — the check exists to keep TypeScript (and
	// a reader) honest that phoneE164 is a string past this point, not to
	// paper over a real gap.
	if (!phoneE164) {
		return { ok: false, code: 'validation_error', message: 'Некорректный номер телефона' }
	}

	const candidate: OrderRecord = {
		id: input.idempotencyKey,
		orderReference: input.idempotencyKey.slice(0, 8).toUpperCase(),
		createdAt: new Date().toISOString(),
		customer: {
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
			phone: phoneE164,
			birthDate: input.birthDate,
			delivery: input.delivery,
			address: input.delivery === 'delivery' ? input.address.trim() : 'самовывоз',
			email: input.email.trim(),
		},
		lines: resolved.lines,
		total: resolved.total,
		notified: false,
	}

	let created: boolean
	let order: OrderRecord
	try {
		;({ created, order } = await createOrderIfNotExists(candidate))
	} catch {
		return {
			ok: false,
			code: 'persist_failed',
			message: 'Не удалось сохранить заказ. Попробуйте ещё раз.',
		}
	}

	if (order.notified) {
		// A concurrent request for the same key already finished the whole
		// pipeline (persisted and notified) between our idempotency check
		// above and our write just now.
		return { ok: true, orderId: order.id, orderReference: order.orderReference }
	}

	if (!created) {
		// A concurrent request (e.g. an actual double-click producing two
		// near-simultaneous requests) won the atomic create — it owns
		// notifying for this order, not us. Reporting a temporary failure
		// here is honest and safe: a later retry with the same key hits the
		// fast path above and either finds it notified by then, or attempts
		// notification itself.
		return {
			ok: false,
			code: 'notification_failed',
			message: 'Заказ обрабатывается, попробуйте ещё раз через несколько секунд.',
			orderId: order.id,
		}
	}

	return attemptNotify(order)
}
