// Two schemas sharing one rule set. checkoutFormFieldsSchema is what
// CheckoutForm validates against client-side (just the visible fields —
// UX feedback only). checkoutInputSchema adds `items` and
// `idempotencyKey`, which aren't form inputs, and is what the server
// actually enforces in lib/orders/actions.ts — the guarantee, not the
// client copy. Both run the exact same superRefine body, so the rules
// themselves (phone format, birth date, delivery/address) can never drift
// between the two.

import { z } from 'zod'
import { cartItemSchema } from '@/lib/cart/schema'
import { normalizeRuPhoneE164 } from './phone'
import { validateBirth } from './validateBirthDate'

const checkoutFieldsShape = z.object({
	phone: z.string(),
	lastName: z.string().trim().min(1, 'фамилия обязательна'),
	firstName: z.string().trim().min(1, 'имя обязательно'),
	birthDate: z.string(),
	delivery: z.enum(['pickup', 'delivery']),
	address: z.string().optional().default(''),
	email: z.string().optional().default(''),
})

function checkoutBusinessRules(
	data: z.infer<typeof checkoutFieldsShape>,
	ctx: z.RefinementCtx
) {
	if (!normalizeRuPhoneE164(data.phone)) {
		ctx.addIssue({ code: 'custom', path: ['phone'], message: 'введите 10 цифр' })
	}

	const birthResult = validateBirth(data.birthDate)
	if (birthResult !== true) {
		ctx.addIssue({ code: 'custom', path: ['birthDate'], message: birthResult })
	}

	if (data.delivery === 'delivery' && !data.address.trim()) {
		ctx.addIssue({ code: 'custom', path: ['address'], message: 'укажите адрес' })
	}
}

export const checkoutFormFieldsSchema = checkoutFieldsShape.superRefine(checkoutBusinessRules)
export type CheckoutFormFields = z.infer<typeof checkoutFormFieldsSchema>

export const checkoutInputSchema = checkoutFieldsShape
	.extend({
		items: z.array(cartItemSchema).min(1, 'корзина пуста'),
		// Client-generated once per checkout attempt and reused across
		// retries of the *same* attempt — see components/checkout/
		// CheckoutForm.tsx. Lets the server tell "user clicked submit twice"
		// and "user is retrying after a notification failure" apart from
		// "user is placing a brand-new order", without a login/session.
		idempotencyKey: z.uuid(),
	})
	.superRefine(checkoutBusinessRules)
export type CheckoutInput = z.infer<typeof checkoutInputSchema>

// ok:true means fully confirmed — persisted AND the shop was notified.
// Anything less (validation failed, the order couldn't be persisted, or it
// persisted but Telegram couldn't be reached) is ok:false: the customer
// must see a real failure state, never a success screen for a half-done
// submission. When the order *did* persist (only the notification failed),
// `orderId` is included so a retry re-sends the notification for that same
// order instead of validating and persisting a duplicate.
export type SubmitOrderResult =
	| { ok: true; orderId: string; orderReference: string }
	| {
			ok: false
			code:
				| 'validation_error'
				| 'unavailable_items'
				| 'below_minimum'
				| 'notification_failed'
				| 'persist_failed'
			message: string
			fieldErrors?: Record<string, string>
			orderId?: string
	  }
