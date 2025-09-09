// src/components/ProductCart/CheckoutForm.jsx
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'

// --- helpers ---
const validateBirth = v => {
	const re = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/
	if (!re.test(v)) return 'формат: ДД.ММ.ГГГГ'
	const [dd, mm, yyyy] = v.split('.').map(Number)
	const dob = new Date(yyyy, mm - 1, dd)
	if (Number.isNaN(dob.getTime())) return 'некорректная дата'
	const today = new Date()
	let age = today.getFullYear() - dob.getFullYear()
	const m = today.getMonth() - dob.getMonth()
	if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
	return age >= 16 || 'только 16+'
}

const normalizeRuPhoneE164 = raw => {
	const digits = String(raw || '').replace(/\D/g, '')
	if (digits.length !== 11) return null
	// допускаем 8XXXXXXXXXX или 7XXXXXXXXXX → приводим к +7XXXXXXXXXX
	const last10 = digits.slice(-10)
	return '+7' + last10
}

const CheckoutForm = forwardRef(function CheckoutForm({ onSubmitted }, ref) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		setFocus,
		trigger,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			phone: '',
			lastName: '',
			firstName: '',
			birthDate: '',
			delivery: 'pickup',
			address: '',
		},
		mode: 'onSubmit',
	})

	const delivery = watch('delivery')
	const [ageError, setAgeError] = useState('')

	useEffect(() => {
		if (delivery === 'pickup') setValue('address', '')
	}, [delivery, setValue])

	const onSubmit = data => {
		// birth date
		const res = validateBirth(data.birthDate)
		if (res !== true) {
			setAgeError(String(res))
			setFocus('birthDate')
			return
		}
		setAgeError('')

		// phone
		const phoneE164 = normalizeRuPhoneE164(data.phone)
		if (!phoneE164) {
			// если не прошла нормализация — подсветим поле
			// (валидация уже сделает сообщение, но перестрахуемся)
			setFocus('phone')
			return
		}

		const payload = {
			...data,
			phone: phoneE164, // нормализованный телефон
		}

		console.log('[CheckoutForm] valid submit payload:', payload)
		onSubmitted?.(payload)
	}

	const onInvalid = errs => {
		console.warn('[CheckoutForm] invalid submit:', errs)
		const first = Object.keys(errs || {})[0]
		setFocus(first || 'phone')
	}

	// отдаём наружу submit/focus/validate
	useImperativeHandle(ref, () => ({
		submit: () => {
			console.log('[CheckoutForm] submit() called from parent')
			handleSubmit(onSubmit, onInvalid)()
		},
		focusFirst: () => setFocus('phone'),
		validate: async () => {
			const ok = await trigger()
			if (!ok) {
				const first = Object.keys(errors || {})[0]
				setFocus(first || 'phone')
			}
			return ok
		},
		isSubmitting,
	}))

	return (
		<form
			onSubmit={handleSubmit(onSubmit, onInvalid)}
			className='px-4 pb-4 pt-2 bg-white'
		>
			{/* Блок: данные клиента */}
			<div className='text-black text-xs font-baron mb-2'>данные клиента</div>

			<div className='space-y-2'>
				{/* Телефон: валидирует +7XXXXXXXXXX или 8XXXXXXXXXX (11 цифр, любые разделители) */}
				<input
					{...register('phone', {
						required: 'укажите номер',
						validate: v => {
							const e164 = normalizeRuPhoneE164(v)
							return e164 ? true : 'введите 11 цифр, начиная с +7 или 8'
						},
					})}
					placeholder='+7 (___) - ___ - __ - __'
					className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 outline-none'
				/>
				{errors.phone && (
					<div className='text-[10px] text-red-500'>{errors.phone.message}</div>
				)}

				<input
					{...register('lastName', { required: 'фамилия обязательна' })}
					placeholder='Фамилия'
					className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 outline-none'
				/>
				{errors.lastName && (
					<div className='text-[10px] text-red-500'>
						{errors.lastName.message}
					</div>
				)}

				<input
					{...register('firstName', { required: 'имя обязательно' })}
					placeholder='Имя'
					className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 outline-none'
				/>
				{errors.firstName && (
					<div className='text-[10px] text-red-500'>
						{errors.firstName.message}
					</div>
				)}

				<input
					{...register('birthDate', { required: 'дата рождения обязательна' })}
					placeholder='дата рождения (ДД.ММ.ГГГГ)'
					className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 outline-none'
				/>
				{(errors.birthDate || ageError) && (
					<div className='text-[10px] text-red-500'>
						{errors.birthDate?.message || ageError}
					</div>
				)}
			</div>

			<div className='mt-2 text-center text-stone-600 text-xs font-baron'>
				реализация продукции лицам моложе 16 лет — запрещена
			</div>

			{/* Блок: доставка */}
			<div className='mt-4 text-black text-xs font-baron mb-2'>доставка</div>

			<div className='flex gap-2'>
				<button
					type='button'
					onClick={() =>
						setValue('delivery', 'pickup', { shouldValidate: true })
					}
					className={[
						'w-1/2 h-9 px-2.5 rounded-[10px] text-xs font-baron',
						watch('delivery') === 'pickup'
							? 'bg-[#bd52e9] text-white'
							: 'bg-stone-200 text-black',
					].join(' ')}
				>
					самовывоз
				</button>

				<button
					type='button'
					onClick={() =>
						setValue('delivery', 'delivery', { shouldValidate: true })
					}
					className={[
						'w-1/2 h-9 px-2.5 rounded-[10px] text-xs font-baron',
						watch('delivery') === 'delivery'
							? 'bg-[#bd52e9] text-white'
							: 'bg-stone-200 text-black',
					].join(' ')}
				>
					доставка
				</button>
			</div>

			{watch('delivery') === 'pickup' ? (
				<div className='mt-2 w-full h-9 px-2.5 rounded-[10px] outline outline-1 outline-zinc-300 grid place-items-center text-stone-600 text-xs font-baron'>
					каховская 1А/С
				</div>
			) : (
				<div className='mt-2'>
					<input
						{...register('address', {
							required:
								watch('delivery') === 'delivery' ? 'укажите адрес' : false,
						})}
						placeholder='Адрес доставки'
						className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 outline-none'
					/>
					{errors.address && (
						<div className='text-[10px] text-red-500'>
							{errors.address.message}
						</div>
					)}
				</div>
			)}

			<div className='mt-1 text-center text-zinc-400 text-[8px] font-baron'>
				оплата при получении
			</div>
		</form>
	)
})

export default CheckoutForm
