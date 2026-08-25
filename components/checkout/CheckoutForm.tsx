'use client'

import { useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { CartItem } from '@/lib/cart/schema'
import { normalizeRuPhoneE164 } from '@/lib/orders/phone'
import { validateBirth } from '@/lib/orders/validateBirthDate'
import { submitOrder } from '@/lib/orders/actions'
import type { SubmitOrderResult } from '@/lib/orders/schema'

interface FormValues {
	phone: string
	lastName: string
	firstName: string
	birthDate: string
	delivery: 'pickup' | 'delivery'
	address: string
}

type Phase = 'idle' | 'submitting' | 'error'

export default function CheckoutForm({
	items,
	onConfirmed,
}: {
	items: CartItem[]
	onConfirmed: (result: { orderId: string; orderReference: string }) => void
}) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		setFocus,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: { phone: '', lastName: '', firstName: '', birthDate: '', delivery: 'pickup', address: '' },
		mode: 'onSubmit',
	})

	const [phase, setPhase] = useState<Phase>('idle')
	const [errorMessage, setErrorMessage] = useState('')
	// Stable for the lifetime of this attempt: a retry after a notification
	// failure reuses it, so the server matches it to the already-persisted
	// order instead of validating and persisting a duplicate (see
	// lib/orders/actions.ts). Only a fresh mount of this form — a new
	// checkout attempt — gets a new one.
	const idempotencyKey = useMemo(() => crypto.randomUUID(), [])
	const delivery = watch('delivery')
	const formId = useId()

	const onValid = async (values: FormValues) => {
		setPhase('submitting')
		setErrorMessage('')

		const phoneE164 = normalizeRuPhoneE164(values.phone)
		if (!phoneE164) {
			setFocus('phone')
			setPhase('idle')
			return
		}

		const result: SubmitOrderResult = await submitOrder({
			...values,
			phone: phoneE164,
			items,
			idempotencyKey,
		})

		if (result.ok) {
			onConfirmed({ orderId: result.orderId, orderReference: result.orderReference })
			return
		}

		setErrorMessage(result.message)
		setPhase('error')
	}

	return (
		<form
			id={formId}
			onSubmit={handleSubmit(onValid)}
			className="font-baron space-y-2 border-t border-[#efebe6] px-4 py-3 text-sm"
		>
			<p className="text-xs text-[#625a51]">данные для заказа</p>

			<div>
				<label htmlFor="checkout-phone" className="sr-only">
					Телефон
				</label>
				<input
					id="checkout-phone"
					type="tel"
					inputMode="tel"
					placeholder="Телефон"
					{...register('phone', {
						required: 'укажите номер',
						validate: v => (normalizeRuPhoneE164(v) ? true : 'введите 10 цифр'),
					})}
					className="h-9 w-full rounded-lg bg-stone-100 px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
				/>
				{errors.phone && <p className="text-[10px] text-red-600">{errors.phone.message}</p>}
			</div>

			<div>
				<label htmlFor="checkout-lastName" className="sr-only">
					Фамилия
				</label>
				<input
					id="checkout-lastName"
					placeholder="Фамилия"
					{...register('lastName', { required: 'фамилия обязательна' })}
					className="h-9 w-full rounded-lg bg-stone-100 px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
				/>
				{errors.lastName && <p className="text-[10px] text-red-600">{errors.lastName.message}</p>}
			</div>

			<div>
				<label htmlFor="checkout-firstName" className="sr-only">
					Имя
				</label>
				<input
					id="checkout-firstName"
					placeholder="Имя"
					{...register('firstName', { required: 'имя обязательно' })}
					className="h-9 w-full rounded-lg bg-stone-100 px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
				/>
				{errors.firstName && <p className="text-[10px] text-red-600">{errors.firstName.message}</p>}
			</div>

			<div>
				<label htmlFor="checkout-birthDate" className="sr-only">
					Дата рождения (ДД.ММ.ГГГГ)
				</label>
				<input
					id="checkout-birthDate"
					placeholder="Дата рождения: ДД.ММ.ГГГГ"
					inputMode="numeric"
					maxLength={10}
					{...register('birthDate', { required: 'дата рождения обязательна', validate: validateBirth })}
					className="h-9 w-full rounded-lg bg-stone-100 px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
				/>
				{errors.birthDate && <p className="text-[10px] text-red-600">{errors.birthDate.message}</p>}
				<p className="mt-1 text-[10px] text-[#9c9c9c]">продажа пиротехники лицам младше 16 лет запрещена</p>
			</div>

			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => setValue('delivery', 'pickup')}
					className={`h-9 flex-1 rounded-lg text-xs ${delivery === 'pickup' ? 'bg-firework-red text-white' : 'bg-stone-100 text-[#333]'}`}
				>
					самовывоз
				</button>
				<button
					type="button"
					onClick={() => setValue('delivery', 'delivery')}
					className={`h-9 flex-1 rounded-lg text-xs ${delivery === 'delivery' ? 'bg-firework-red text-white' : 'bg-stone-100 text-[#333]'}`}
				>
					доставка
				</button>
			</div>

			{delivery === 'pickup' ? (
				<p className="rounded-lg border border-stone-200 px-3 py-2 text-center text-[11px] text-[#625a51]">
					каховская 1А/С
				</p>
			) : (
				<div>
					<label htmlFor="checkout-address" className="sr-only">
						Адрес доставки
					</label>
					<input
						id="checkout-address"
						placeholder="Адрес доставки"
						{...register('address', {
							required: delivery === 'delivery' ? 'укажите адрес' : false,
						})}
						className="h-9 w-full rounded-lg bg-stone-100 px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
					/>
					{errors.address && <p className="text-[10px] text-red-600">{errors.address.message}</p>}
				</div>
			)}

			{phase === 'error' && (
				<div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">
					{errorMessage}
				</div>
			)}

			<button
				type="submit"
				disabled={phase === 'submitting'}
				aria-busy={phase === 'submitting'}
				className="btn-firework mt-2 w-full disabled:opacity-70"
			>
				{phase === 'submitting' ? 'отправляем…' : phase === 'error' ? 'повторить' : 'оформить заказ'}
			</button>
		</form>
	)
}
