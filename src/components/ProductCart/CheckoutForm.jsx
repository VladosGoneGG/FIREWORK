// src/components/ProductCart/CheckoutForm.jsx
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import telplace from '../../assets/SVG/placeTelef.svg'
import PhoneInputRU from '../ui/PhoneInputRU'

// ===== helpers =====
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

// Принимаем 10 (нац.) или 11 цифр -> E.164
const normalizeRuPhoneE164 = raw => {
	const d = String(raw || '').replace(/\D/g, '')
	if (d.length === 11) return '+7' + d.slice(-10)
	if (d.length === 10) return '+7' + d
	return null
}

// Автоформат «ДД.ММ.ГГГГ» во время набора
const formatBirthTyping = raw => {
	const digits = String(raw || '')
		.replace(/\D/g, '')
		.slice(0, 8) // максимум 8 цифр
	if (!digits) return ''
	if (digits.length <= 2) return digits
	if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`
	return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

const CheckoutForm = forwardRef(function CheckoutForm({ onSubmitted }, ref) {
	const {
		control,
		register,
		handleSubmit,
		watch,
		setValue,
		setFocus,
		trigger,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			phone: '', // в форме храним РОВНО 10 нац. цифр
			lastName: '',
			firstName: '',
			birthDate: '',
			delivery: 'pickup',
			address: '',
		},
		mode: 'onSubmit',
	})

	const delivery = watch('delivery')
	const lastName = watch('lastName')
	const firstName = watch('firstName')
	const birthDate = watch('birthDate')

	useEffect(() => {
		if (delivery === 'pickup') setValue('address', '')
	}, [delivery, setValue])

	const onSubmit = data => {
		const phoneE164 = normalizeRuPhoneE164(data.phone) // "+7XXXXXXXXXX"
		if (!phoneE164) {
			setFocus('phone')
			return
		}
		const payload = { ...data, phone: phoneE164 }
		console.log('[CheckoutForm] valid submit payload:', payload)
		onSubmitted?.(payload)
	}

	const onInvalid = errs => {
		console.warn('[CheckoutForm] invalid submit:', errs)
		const first = Object.keys(errs || {})[0]
		setFocus(first || 'phone')
	}

	useImperativeHandle(ref, () => ({
		submit: () => handleSubmit(onSubmit, onInvalid)(),
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

	// флаги для зелёных индикаторов (ФИО/Дата)
	const lnIsValid = useMemo(() => !!String(lastName || '').trim(), [lastName])
	const fnIsValid = useMemo(() => !!String(firstName || '').trim(), [firstName])
	const bdIsValid = useMemo(
		() => validateBirth(birthDate) === true,
		[birthDate]
	)

	return (
		<form
			onSubmit={handleSubmit(onSubmit, onInvalid)}
			className=' pb-4 pt-2 bg-white'
		>
			{/* Блок: данные клиента */}
			<div className='text-black text-xs font-baron mb-2'>данные клиента</div>

			<div className='space-y-2'>
				{/* Телефон */}
				<Controller
					name='phone'
					control={control}
					rules={{
						required: 'укажите номер',
						validate: v =>
							String(v || '').length === 10 ? true : 'введите 10 цифр',
					}}
					render={({ field }) => (
						<>
							<PhoneInputRU
								value={field.value || ''} // храним 10 цифр
								onChange={field.onChange}
								onBlur={field.onBlur}
								placeholderSvg={telplace}
							/>
							{errors.phone && (
								<div className='text-[10px] text-red-500'>
									{errors.phone.message}
								</div>
							)}
						</>
					)}
				/>

				{/* Фамилия */}
				<div className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] inline-flex items-center gap-3.5'>
					<div
						className={[
							'w-2.5 h-2.5 rounded-full transition-colors',
							lnIsValid ? 'bg-green-600' : 'bg-zinc-300',
						].join(' ')}
					/>
					<input
						{...register('lastName', { required: 'фамилия обязательна' })}
						placeholder='Фамилия'
						className='flex-1 h-8 bg-transparent text-xs font-baron text-black placeholder-zinc-400 outline-none'
					/>
				</div>
				{errors.lastName && (
					<div className='text-[10px] text-red-500'>
						{errors.lastName.message}
					</div>
				)}

				{/* Имя */}
				<div className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] inline-flex items-center gap-3.5'>
					<div
						className={[
							'w-2.5 h-2.5 rounded-full transition-colors',
							fnIsValid ? 'bg-green-600' : 'bg-zinc-300',
						].join(' ')}
					/>
					<input
						{...register('firstName', { required: 'имя обязательно' })}
						placeholder='Имя'
						className='flex-1 h-8 bg-transparent text-xs font-baron text-black placeholder-zinc-400 outline-none'
					/>
				</div>
				{errors.firstName && (
					<div className='text-[10px] text-red-500'>
						{errors.firstName.message}
					</div>
				)}

				{/* Дата рождения (автоформат + валидация 16+) */}
				<div className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] inline-flex items-center gap-3.5'>
					<div
						className={[
							'w-2.5 h-2.5 rounded-full transition-colors',
							bdIsValid ? 'bg-green-600' : 'bg-zinc-300',
						].join(' ')}
					/>
					<input
						{...register('birthDate', {
							required: 'дата рождения обязательна',
							validate: v => validateBirth(v), // true / текст ошибки
							onChange: e =>
								setValue('birthDate', formatBirthTyping(e.target.value), {
									shouldValidate: false, // валидация — при сабмите
								}),
						})}
						placeholder='ДД.ММ.ГГГГ'
						inputMode='numeric'
						maxLength={10} // "ДД.ММ.ГГГГ"
						className='flex-1 h-8 bg-transparent text-xs font-baron text-black placeholder-zinc-400 outline-none'
					/>
				</div>
				{errors.birthDate && (
					<div className='text-[10px] text-red-500'>
						{errors.birthDate.message}
					</div>
				)}
			</div>

			<div className='mt-2 text-center text-stone-600 text-xs font-baron'>
				реализация продукции лицам <br /> моложе 16 лет — запрещена
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
						'w-1/2 h-9 px-2.5 rounded-[10px] text-xs font-baron cursor-pointer',
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
						'w-1/2 h-9 px-2.5 rounded-[10px] text-xs font-baron cursor-pointer',
						watch('delivery') === 'delivery'
							? 'bg-[#bd52e9] text-white'
							: 'bg-stone-200 text-black',
					].join(' ')}
				>
					доставка
				</button>
			</div>

			{watch('delivery') === 'pickup' ? (
				<div className='mt-2 w-full h-9 px-2.5 rounded-[10px] outline-1 outline-zinc-300 grid place-items-center text-stone-600 text-xs font-baron'>
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
