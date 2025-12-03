import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import telplace from '../../assets/SVG/placeTelef.svg'
import PhoneInputRU from '../ui/PhoneInputRU'

// =============================
// Утилиты валидации и форматирования
// =============================
const BIRTH_DATE_REGEX = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/
const MIN_AGE = 16

const validateBirth = value => {
	if (!BIRTH_DATE_REGEX.test(value)) {
		return 'формат: ДД.ММ.ГГГГ'
	}

	const [day, month, year] = value.split('.').map(Number)
	const birthDate = new Date(year, month - 1, day)

	if (Number.isNaN(birthDate.getTime())) {
		return 'некорректная дата'
	}

	const today = new Date()
	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDiff = today.getMonth() - birthDate.getMonth()

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}

	return age >= MIN_AGE || 'только 16+'
}

const normalizeRuPhoneE164 = rawPhone => {
	const digitsOnly = String(rawPhone || '').replace(/\D/g, '')

	if (digitsOnly.length === 11) {
		return '+7' + digitsOnly.slice(-10)
	}
	if (digitsOnly.length === 10) {
		return '+7' + digitsOnly
	}

	return null
}

const formatBirthTyping = raw => {
	const digits = String(raw || '').replace(/\D/g, '').slice(0, 8)

	if (!digits) return ''
	if (digits.length <= 2) return digits
	if (digits.length <= 4) {
		return `${digits.slice(0, 2)}.${digits.slice(2)}`
	}

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
	const lastName = watch('lastName')
	const firstName = watch('firstName')
	const birthDate = watch('birthDate')

	useEffect(() => {
		if (delivery === 'pickup') setValue('address', '')
	}, [delivery, setValue])

	const onSubmit = data => {
		const phoneE164 = normalizeRuPhoneE164(data.phone)
		if (!phoneE164) {
			setFocus('phone')
			return
		}
		const payload = { ...data, phone: phoneE164 }
		onSubmitted?.(payload)
	}

	const onInvalid = errs => {
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

	const lnIsValid = useMemo(() => !!String(lastName || '').trim(), [lastName])
	const fnIsValid = useMemo(() => !!String(firstName || '').trim(), [firstName])
	const bdIsValid = useMemo(
		() => validateBirth(birthDate) === true,
		[birthDate]
	)

	return (
		<form
			onSubmit={handleSubmit(onSubmit, onInvalid)}
			className={[
				// твои текущие классы — без «режимов»
				'pb-4 pt-2 bg-white',

				'max-[1040px]:overflow-y-auto',
				'max-[1040px]:pr-1',
				'max-[1040px]:pb-3',
				'max-[1040px]:flex',
				'max-[1040px]:flex-col',
				'max-[1040px]:items-center',
				'max-[1040px]:mt-[50px]',
				'max-[475px]:mt-[5px]',
				'[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
			].join(' ')}
		>
			<div className='space-y-2 max-[1040px]:max-w-[275px]'>
				<div className='text-black text-xs font-baron mb-2'>данные клиента</div>

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
								value={field.value || ''}
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

				{/* Дата рождения */}
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
							validate: v => validateBirth(v),
							onChange: e =>
								setValue('birthDate', formatBirthTyping(e.target.value), {
									shouldValidate: false,
								}),
						})}
						placeholder='ДД.ММ.ГГГГ'
						inputMode='numeric'
						maxLength={10}
						className='flex-1 h-8 bg-transparent text-xs font-baron text-black placeholder-zinc-400 outline-none'
					/>
				</div>
				{errors.birthDate && (
					<div className='text-[10px] text-red-500'>
						{errors.birthDate.message}
					</div>
				)}
			</div>

			<div className='mt-2 text-center text-stone-600 text-xs font-baron max-[1040px]:hidden'>
				реализация продукции лицам <br /> моложе 16 лет — запрещена
			</div>

			<div className='max-[1040px]:max-w-full'>
				<div className='mt-4 text-black text-xs text-left font-baron mb-2'>
					доставка
				</div>

				<div className='flex gap-2 max-[1040px]:w-full max-[1040px]:max-w-[360px] max-[1040px]:mx-auto max-[1040px]:flex-row'>
					<button
						type='button'
						onClick={() =>
							setValue('delivery', 'pickup', { shouldValidate: true })
						}
						className={[
							'w-1/2 h-9 px-2.5 rounded-[10px] text-xs font-baron cursor-pointer',
							'max-[1040px]:w-[190px] max-[1040px]:flex-1 max-[1040px]:min-w-0',
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
							'max-[1040px]:w-auto max-[1040px]:flex-1 max-[1040px]:min-w-0',
							watch('delivery') === 'delivery'
								? 'bg-[#bd52e9] text-white'
								: 'bg-stone-200 text-black',
						].join(' ')}
					>
						доставка
					</button>
				</div>

				{watch('delivery') === 'pickup' ? (
					<div className='mt-2 w-full h-9 px-2.5 rounded-[10px] outline-1 outline-zinc-300 grid place-items-center text-stone-600 text-xs font-baron max-[1040px]:max-w-[275px] max-[1040px]:mx-auto'>
						каховская 1А/С
					</div>
				) : (
					<div className='mt-2 max-[1040px]:mx-auto max-[1040px]:w-full max-[1040px]:max-w-[275px]'>
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
			</div>
		</form>
	)
})

export default CheckoutForm
