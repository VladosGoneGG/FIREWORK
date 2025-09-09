import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

// ===== helpers =====
const onlyDigits = s => String(s || '').replace(/\D/g, '')

// 7/8 в начале отбрасываем. Максимум 10 нац. цифр.
const toNat10 = s => {
	let d = onlyDigits(s)
	if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1)
	return d.slice(0, 10)
}

// "+7 (xxx)-xxx-xx-xx" (частичное тоже ок)
const formatNat10 = n10 => {
	if (!n10) return ''
	const a = n10.slice(0, 3)
	const b = n10.slice(3, 6)
	const c = n10.slice(6, 8)
	const e = n10.slice(8, 10)
	let out = '+7'
	if (a) out += ` (${a}`
	if (a.length === 3) out += ')'
	if (b) out += `-${b}`
	if (c) out += `-${c}`
	if (e) out += `-${e}`
	return out
}

// сколько нац. цифр слева от каретки (в уже отформатированной строке)
const countNatDigitsUpToCaret = (formatted, caretPos) => {
	const start = formatted.indexOf('(') >= 0 ? formatted.indexOf('(') + 1 : 0
	let cnt = 0
	for (let i = start; i < Math.min(caretPos ?? 0, formatted.length); i++) {
		if (/\d/.test(formatted[i])) cnt++
	}
	return cnt
}

// где поставить каретку в formatted по индексу нац. цифры
const caretPosFromNatIndex = (formatted, natIndex) => {
	const start = formatted.indexOf('(') >= 0 ? formatted.indexOf('(') + 1 : 0
	if (natIndex <= 0) return start
	let cnt = 0
	for (let i = start; i < formatted.length; i++) {
		if (/\d/.test(formatted[i])) {
			if (cnt === natIndex) return i
			cnt++
		}
	}
	return formatted.length
}

const PhoneInputRU = forwardRef(function PhoneInputRU(
	{ value = '', onChange, onBlur, onFocus, placeholderSvg, className = '' },
	ref
) {
	const inputRef = useRef(null)
	const [focused, setFocused] = useState(false)

	// внутренние рефы для корректной каретки
	const prevNatLenRef = useRef(String(value).length)
	const prevNatIndexRef = useRef(0)

	useImperativeHandle(ref, () => ({
		focus: () => inputRef.current?.focus(),
		setSelection: pos => inputRef.current?.setSelectionRange(pos, pos),
	}))

	const nat = String(value || '')
	const formatted = formatNat10(nat)

	const handleKeyDown = e => {
		const el = inputRef.current
		if (!el) return
		const start = el.selectionStart ?? 0
		const end = el.selectionEnd ?? 0

		prevNatIndexRef.current = countNatDigitsUpToCaret(formatted, start)
		prevNatLenRef.current = nat.length

		// Точный Backspace: удаляем цифру слева от каретки (а не «через одну»)
		if (e.key === 'Backspace' && start === end) {
			e.preventDefault()
			const idx = prevNatIndexRef.current
			if (idx <= 0) return // нечего удалять
			const delIndex = idx - 1
			const nextNat = nat.slice(0, delIndex) + nat.slice(delIndex + 1)
			onChange?.(nextNat)
			requestAnimationFrame(() => {
				const pos = caretPosFromNatIndex(formatNat10(nextNat), delIndex)
				inputRef.current?.setSelectionRange(pos, pos)
			})
		}
	}

	const handleChange = e => {
		const raw = e.target.value
		const nextNat = toNat10(raw)

		// стараемся сохранить позицию по количеству цифр слева
		const diff = nextNat.length - prevNatLenRef.current
		let targetNatIndex = prevNatIndexRef.current + Math.max(diff, 0)
		if (!Number.isFinite(targetNatIndex)) targetNatIndex = nextNat.length
		targetNatIndex = Math.max(0, Math.min(targetNatIndex, nextNat.length))

		onChange?.(nextNat)
		requestAnimationFrame(() => {
			const pos = caretPosFromNatIndex(formatNat10(nextNat), targetNatIndex)
			inputRef.current?.setSelectionRange(pos, pos)
		})
	}

	return (
		<div
			className={
				'w-full h-9 px-2.5 bg-stone-200 rounded-[10px] relative inline-flex items-center gap-3.5 ' +
				className
			}
		>
			{/* индикатор валидности */}
			<div
				className={[
					'w-2.5 h-2.5 rounded-full transition-colors',
					nat.length === 10 ? 'bg-green-600' : 'bg-zinc-300',
				].join(' ')}
				aria-hidden='true'
			/>

			<input
				ref={inputRef}
				value={formatted}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={e => {
					setFocused(true)
					onFocus?.(e)
				}}
				onBlur={e => {
					setFocused(false)
					onBlur?.(e)
				}}
				inputMode='tel'
				autoComplete='tel'
				placeholder=''
				className='flex-1 h-8 bg-transparent text-xs font-baron text-black placeholder-zinc-400 outline-none'
			/>

			{/* SVG overlay как плейсхолдер (когда пусто и нет фокуса) */}
			{!nat && !focused && (
				<div className='pointer-events-none select-none absolute inset-0 px-2.5 flex items-center gap-3.5 text-xs text-zinc-400'>
					<div
						className='w-2.5 h-2.5 rounded-full bg-zinc-300'
						aria-hidden='true'
					/>
					{placeholderSvg ? (
						<img src={placeholderSvg} alt='' className='w-[128px] h-[12px]' />
					) : null}
				</div>
			)}
		</div>
	)
})

export default PhoneInputRU
