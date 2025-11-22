// src/components/SubcategoryOverlay/SubcategoryOverlay.jsx
import { motion } from 'framer-motion'
import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Глобальные фильтры
import {
	applyNow,
	resetForm,
	selectFiltersForm,
	selectPreviewCount,
	setField as setFieldAction,
} from '../../store/slices/filtersSlice'

// Данные каталога (для динамических списков)
const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
const nnum = v => (Number.isFinite(Number(v)) ? Number(v) : 0)
const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()
		.replaceAll('ё', 'е')

// ===== чекбокс-строка (моб. размер) =====
function WhiteCheckRow({ label, checked, onToggle }) {
	const [hover, setHover] = React.useState(false)
	const [active, setActive] = React.useState(false)

	const COLOR_BASE_BG = '#EFEBE6'
	const COLOR_HOVER_CENTER = 'rgba(153,125,245,0.5)'
	const COLOR_ACTIVE_BORDER = '#BD52E9'
	const COLOR_CHECKED_CENTER = '#BF53EA'
	const COLOR_HOVER_CHECKED_CENTER = '#BD52E9'
	const COLOR_HOVER_CHECKED_BORDER = 'rgba(153,125,245,0.5)'

	// фиксированный размер центральной точки
	const INNER = 7.6

	// «чуть» уменьшаем обводку: тонкое кольцо 1.5px на hover/active
	const borderPx = (checked && hover) || active ? 2 : 2

	// внешний круг ровно вплотную к точке (без просвета)
	const OUTER = INNER + 2 * borderPx

	// цвет точки
	let dotColor = COLOR_BASE_BG
	if (!checked) {
		dotColor = hover ? COLOR_HOVER_CENTER : COLOR_BASE_BG
	} else {
		dotColor = hover ? COLOR_HOVER_CHECKED_CENTER : COLOR_CHECKED_CENTER
	}

	// цвет кольца
	let ringColor = 'transparent'
	if (checked && hover) ringColor = COLOR_HOVER_CHECKED_BORDER
	if (active) ringColor = COLOR_ACTIVE_BORDER

	return (
		<button
			type='button'
			role='checkbox'
			aria-checked={checked}
			onClick={onToggle}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => {
				setHover(false)
				setActive(false)
			}}
			onMouseDown={() => setActive(true)}
			onMouseUp={() => setActive(false)}
			className={[
				'w-full h-5 px-2 bg-white rounded-[6px]',
				'flex items-center gap-2 text-[10px] font-baron text-black',
				'transition-colors select-none cursor-pointer',
				active ? 'bg-[#efece7]' : '',
			].join(' ')}
			title={label}
		>
			{/* внешний круг: фон как у подложки, чтобы не было белого ореола */}
			<span
				className='shrink-0 grid place-items-center rounded-full'
				style={{
					width: OUTER,
					height: OUTER,
					background: COLOR_BASE_BG,
					borderStyle: 'solid',
					borderWidth: borderPx,
					borderColor: ringColor,
				}}
			>
				{/* центральная точка — фикс 8px */}
				<span
					style={{
						width: INNER,
						height: INNER,
						background: dotColor,
						borderRadius: '50%',
						transition:
							'background-color .12s ease, background .12s ease, border-color .12s ease',
					}}
				/>
			</span>

			<span className='truncate'>{label}</span>
		</button>
	)
}

// ===== двойной слайдер (204px трек) — БЕЗ минимального зазора, с нужными цветами =====
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const snap = (v, step, min) => Math.round((v - min) / step) * step + min

const RangeDual = memo(function RangeDual({
	min = 0,
	max = 20000,
	step = 10,
	valueMin,
	valueMax,
	onChange,
	className = '',
}) {
	const trackRef = React.useRef(null)

	const vMin = clamp(
		Number.isFinite(valueMin) ? valueMin : min,
		min,
		Number.isFinite(valueMax) ? valueMax : max
	)
	const vMax = clamp(
		Number.isFinite(valueMax) ? valueMax : max,
		Number.isFinite(valueMin) ? valueMin : min,
		max
	)

	const range = max - min
	const pMin = ((vMin - min) / range) * 100
	const pMax = ((vMax - min) / range) * 100

	const startDrag = thumb => e => {
		e.preventDefault()
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()

		const getValFromClientX = clientX => {
			const x = clamp(clientX - rect.left, 0, rect.width)
			const raw = min + (x / rect.width) * range
			return clamp(snap(raw, step, min), min, max)
		}

		const move = clientX => {
			const val = getValFromClientX(clientX)
			if (thumb === 'min') {
				// БЕЗ зазора: позволяем min == max
				onChange?.(Math.min(val, vMax), vMax)
			} else {
				onChange?.(vMin, Math.max(val, vMin))
			}
		}

		const onPointerMove = ev => move(ev.clientX)
		const onPointerUp = () => {
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', onPointerUp)
		}
		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerUp)
	}

	const clickOnTrack = e => {
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()
		const x = clamp(e.clientX - rect.left, 0, rect.width)
		const raw = min + (x / rect.width) * range
		const val = clamp(snap(raw, step, min), min, max)
		const distToMin = Math.abs(val - vMin)
		const distToMax = Math.abs(val - vMax)
		// БЕЗ зазора: двигаем ближайший бегунок, допускаем пересечение/равенство
		if (distToMin <= distToMax) onChange?.(Math.min(val, vMax), vMax)
		else onChange?.(vMin, Math.max(val, vMin))
	}

	const TRACK_W = 204

	return (
		<div className={['relative w-full mt-2 pl-[6px]', className].join(' ')}>
			<div
				ref={trackRef}
				className='relative h-[16px] flex items-center select-none justify-center'
				style={{ width: TRACK_W }}
				onPointerDown={e => {
					if (!e.target.dataset.thumb) clickOnTrack(e)
				}}
			>
				{/* Базовая линия трека */}
				<div className='absolute top-1/2 -translate-y-1/2 w-full h-[2px] rounded-[20px] bg-purple-500' />

				{/* Выбранный промежуток */}
				<div
					className='absolute top-1/2 -translate-y-1/2 h-[2px] rounded-[20px] bg-violet-300'
					style={{
						left: `${pMin}%`,
						width: `${Math.max(0, pMax - pMin)}%`,
						transition: 'left .12s ease, width .12s ease',
					}}
				/>

				{/* Бегунки */}
				<button
					type='button'
					data-thumb='min'
					aria-label='Минимум'
					className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] shadow-sm cursor-pointer'
					style={{ left: `${pMin}%`, transition: 'left .12s ease' }}
					onPointerDown={startDrag('min')}
				/>
				<button
					type='button'
					data-thumb='max'
					aria-label='Максимум'
					className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] shadow-sm cursor-pointer'
					style={{ left: `${pMax}%`, transition: 'left .12s ease' }}
					onPointerDown={startDrag('max')}
				/>
			</div>
		</div>
	)
})

// ===== мелкие компоненты =====
function BadgeInput({ label, value, onChange }) {
	return (
		<div className='w-[105px] h-[35px] px-[10px] py-[12px] bg-[#EFEBE6] rounded-[10px] inline-flex items-center gap-[5px]'>
			<div className='text-[8px] text-[#B4B4B4] font-baron'>{label}</div>
			<input
				type='number'
				value={value ?? ''}
				onChange={e =>
					onChange?.(e.target.value === '' ? '' : Number(e.target.value))
				}
				className='flex-1 bg-transparent outline-none text-black text-[12px] font-baron'
			/>
		</div>
	)
}

const Divider = () => (
	<div className='w-[204px] h-[2px] bg-[#EFEBE6] rounded-[20px] mx-auto' />
)

// ===== Редактор тегов (textarea 232×≥65, чипы сверху) =====
// ===== Редактор тегов: "одно поле" (чипы + ввод внутри) =====
const TagsEditor = ({ value = [], onChange }) => {
	const [input, setInput] = useState('')
	const boxRef = useRef(null)
	const inputRef = useRef(null)

	const items = useMemo(() => (Array.isArray(value) ? value : []), [value])

	const toNorm = useCallback(
		t =>
			String(t ?? '')
				.trim()
				.toLowerCase()
				.replaceAll('ё', 'е'),
		[]
	)

	const parseTokens = useCallback(
		s => {
			const parts = String(s)
				.split(/[,\n\r;]+/g)
				.map(toNorm)
				.filter(Boolean)
			const uniq = []
			const seen = new Set()
			for (const p of parts) {
				if (!seen.has(p)) {
					seen.add(p)
					uniq.push(p)
				}
			}
			return uniq
		},
		[toNorm]
	)

	const commit = useCallback(
		raw => {
			const tokens = parseTokens(raw)
			if (!tokens.length) return
			const base = Array.isArray(value) ? value : []
			const seen = new Set(base.map(toNorm))
			const merged = [...base]
			for (const tk of tokens)
				if (!seen.has(tk)) {
					seen.add(tk)
					merged.push(tk)
				}
			onChange?.(merged)
			setInput('')
			// вернуть фокус
			requestAnimationFrame(() => inputRef.current?.focus())
		},
		[value, onChange, parseTokens, toNorm]
	)

	const remove = useCallback(
		tag => {
			const next = (value || []).filter(x => toNorm(x) !== toNorm(tag))
			onChange?.(next)
			requestAnimationFrame(() => inputRef.current?.focus())
		},
		[value, onChange, toNorm]
	)

	const onKeyDown = e => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			commit(input)
		} else if (e.key === 'Backspace' && input === '' && items.length) {
			// удалить последний тег
			e.preventDefault()
			remove(items[items.length - 1])
		}
	}

	const onPaste = e => {
		const txt = (e.clipboardData || window.clipboardData)?.getData('text') || ''
		if (!txt) return
		e.preventDefault()
		commit((input + ',' + txt).replace(/,+/g, ','))
	}

	const onBlur = () => {
		if (input.trim()) commit(input)
	}

	return (
		<div
			ref={boxRef}
			className='w-[232px] min-h-[55px]   py-1 pl-1 bg-transparent rounded-[10px] 
                 text-[10px] font-baron text-black 
                 inline-flex flex-wrap items-start gap-[5px] content-start'
			onClick={() => inputRef.current?.focus()}
			role='group'
			aria-label='Редактор тегов'
		>
			{items.map(tag => (
				<div
					key={tag}
					className='h-5 px-1.5 bg-violet-300 rounded-[10px] 
                     flex justify-center items-center gap-[5px]'
				>
					<div className='text-Black text-[10px] font-baron'>{tag}</div>
					<button
						type='button'
						aria-label='Удалить тег'
						onClick={() => remove(tag)}
						className='w-2.5 h-2.5 grid place-items-center rounded hover:bg-black/10'
					>
						<svg width='10' height='10' viewBox='0 0 20 20' fill='none'>
							<path
								d='M14.0625 5.9375L5.9375 14.0625M5.9375 5.9375L14.0625 14.0625'
								stroke='black'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
				</div>
			))}

			{/* Поле ввода — без рамок, растёт внутри, одна область с чипами */}
			<input
				ref={inputRef}
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyDown={onKeyDown}
				onPaste={onPaste}
				onBlur={onBlur}
				placeholder={items.length ? '' : 'теги'}
				className='flex-1 min-w-[80px] h-5 bg-transparent outline-none 
                   text-[10px] font-baron placeholder:text-[#625A51]/60'
			/>
		</div>
	)
}

/* ===== основной компонент ===== */
export default function SubcategoryOverlay({
	variant = 'standalone', // 'mobile' | 'standalone'
	isOpen,
	onApply,
	onReset,
	onClose,
	// resultsCount игнорируем, считаем из стора
	className = '',
	style = {},
	embed = false, // для аккордеона
}) {
	const dispatch = useDispatch()

	const form = useSelector(selectFiltersForm)
	const previewCount = useSelector(selectPreviewCount)
	const items = useSelector(s => s.products.items || [])

	const deriveOptions = useCallback(
		field =>
			Array.from(new Set(items.map(p => norm(p?.[field])).filter(Boolean))),
		[items]
	)

	const PRODUCT_TYPES = useMemo(
		() =>
			Array.from(new Set(items.map(p => norm(p?.category)).filter(Boolean))),
		[items]
	)
	const MANUFACTURERS = useMemo(
		() => deriveOptions('manufacturer'),
		[deriveOptions]
	)
	const IGNITIONS = useMemo(
		() => deriveOptions('ignitionType'),
		[deriveOptions]
	)
	const VIEWS = useMemo(() => deriveOptions('view'), [deriveOptions])
	const SIZES = useMemo(() => deriveOptions('size'), [deriveOptions])
	const POWERS = useMemo(() => deriveOptions('power'), [deriveOptions])

	const SHOTS_PRESETS = [1, 2, 3, 4, 50, 100]

	const priceMin = nnum(form?.price?.min ?? 0)
	const priceMax = nnum(form?.price?.max ?? 20000)

	const timeMin = nnum(form?.time?.min ?? 0)
	const timeMax = nnum(form?.time?.max ?? 120)

	const setField = useCallback(
		(path, value) => dispatch(setFieldAction({ path, value })),
		[dispatch]
	)

	const onPriceChange = useCallback(
		(lo, hi) => {
			setField('price.min', Math.max(0, Math.floor(lo)))
			setField('price.max', Math.max(0, Math.floor(hi)))
		},
		[setField]
	)

	const onTimeChange = useCallback(
		(lo, hi) => {
			setField('time.min', Math.max(0, Math.floor(lo)))
			setField('time.max', Math.max(0, Math.floor(hi)))
		},
		[setField]
	)

	const toggleArr = useCallback(
		(field, val) => {
			const arr = toArr(form?.[field])
			const next = arr.includes(val)
				? arr.filter(x => x !== val)
				: [...arr, val]
			setField(field, next)
		},
		[form, setField]
	)

	const [visible, setVisible] = React.useState(isOpen)
	React.useEffect(() => {
		if (isOpen) setVisible(true)
	}, [isOpen])

	// размеры по макету
	const W = 240
	const H = 834

	// === MOBILE VARIANT ===
	if (variant === 'mobile') {
		const InnerMobile = (
			<div
				className={[
					'w-auto h-[834px] flex flex-col',
					'bg-white',
					className,
				].join(' ')}
				style={style}
			>
				{/* верхняя тонкая полоска */}
				<div className='self-stretch  flex flex-col gap-[5px]'>
					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />
				</div>

				{/* ТЕЛО: теперь скроллируемое (как на десктопе) */}
				<div
					className={[
						'self-stretch px-5 pb-2.5 relative bg-white flex-1 min-h-0',
						'overflow-y-auto overscroll-contain touch-pan-y scroll-smooth',
						'[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
					].join(' ')}
					onWheelCapture={e => e.stopPropagation()}
					onTouchMoveCapture={e => e.stopPropagation()}
				>
					{/* Теги */}
					<TagsEditor
						value={toArr(form?.tags)}
						onChange={next => setField('tags', next)}
					/>
					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />
					{/* Цена */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-sm font-baron'>Цена</div>
						<div className='inline-flex items-center gap-2.5'>
							<BadgeInput
								label='от'
								value={form?.price?.min}
								onChange={v => setField('price.min', v === '' ? '' : Number(v))}
							/>
							<BadgeInput
								label='до'
								value={form?.price?.max}
								onChange={v => setField('price.max', v === '' ? '' : Number(v))}
							/>
						</div>
						<RangeDual
							min={0}
							max={20000}
							step={10}
							valueMin={priceMin}
							valueMax={priceMax}
							onChange={onPriceChange}
							className='mx-[2px]'
						/>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Тип товара */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>
							тип товара
						</div>
						<div className='flex flex-col gap-1'>
							{PRODUCT_TYPES.map(t => (
								<WhiteCheckRow
									key={t}
									label={t}
									checked={toArr(form?.types).map(norm).includes(t)}
									onToggle={() => toggleArr('types', t)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Производитель */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>
							производитель
						</div>
						<div className='flex flex-col gap-1'>
							{MANUFACTURERS.map(m => (
								<WhiteCheckRow
									key={m}
									label={m}
									checked={toArr(form?.manufacturers).map(norm).includes(m)}
									onToggle={() => toggleArr('manufacturers', m)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Тип воспламенения */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>тип</div>
						<div className='flex flex-col gap-1'>
							{IGNITIONS.map(t => (
								<WhiteCheckRow
									key={t}
									label={t}
									checked={toArr(form?.ignitionType).map(norm).includes(t)}
									onToggle={() => toggleArr('ignitionType', t)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Хлопки */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>хлопки</div>
						<div className='flex flex-col gap-1'>
							{SHOTS_PRESETS.map(n => (
								<WhiteCheckRow
									key={n}
									label={String(n)}
									checked={toArr(form?.shots).includes(n)}
									onToggle={() => toggleArr('shots', n)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Мощность */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>мощность</div>
						<div className='flex flex-col gap-1'>
							{POWERS.map(p => (
								<WhiteCheckRow
									key={p}
									label={p}
									checked={toArr(form?.power).map(norm).includes(p)}
									onToggle={() => toggleArr('power', p)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Вид */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>вид</div>
						<div className='flex flex-col gap-1'>
							{VIEWS.map(v => (
								<WhiteCheckRow
									key={v}
									label={v}
									checked={toArr(form?.view).map(norm).includes(v)}
									onToggle={() => toggleArr('view', v)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Размеры */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>размер</div>
						<div className='flex flex-col gap-1'>
							{SIZES.map(s => (
								<WhiteCheckRow
									key={s}
									label={s}
									checked={toArr(form?.size).map(norm).includes(s)}
									onToggle={() => toggleArr('size', s)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Время работы (как цена) */}
					<div className='flex flex-col gap-2 mb-2'>
						<div className='text-[#625A51] text-sm font-baron'>
							время работы
						</div>
						<div className='inline-flex items-center gap-2.5'>
							<BadgeInput
								label='от'
								value={form?.time?.min}
								onChange={v => setField('time.min', v === '' ? '' : Number(v))}
							/>
							<BadgeInput
								label='до'
								value={form?.time?.max}
								onChange={v => setField('time.max', v === '' ? '' : Number(v))}
							/>
						</div>
						<RangeDual
							min={0}
							max={120}
							step={1}
							valueMin={timeMin}
							valueMax={timeMax}
							onChange={onTimeChange}
							className='mx-[2px]'
						/>
					</div>
				</div>

				{/* футер (вне скролла, как и было) */}
				<div className='self-stretch flex flex-col items-center gap-2.5 px-2.5'>
					<div className='text-center text-zinc-300 text-[12px] font-baron'>
						найдено {previewCount} товар(ов)
					</div>

					<div className='w-[272px] inline-flex items-start gap-2.5'>
						<button
							type='button'
							onClick={() => {
								dispatch(resetForm())
								onReset?.()
							}}
							className='w-[130px] h-[30px] pb-0.5 bg-[#EFEBE6] rounded-[10px] text-black text-[14px] font-baron cursor-pointer hover:text-[#BD52E9] flex justify-center items-center'
						>
							сбросить все
						</button>

						<button
							type='button'
							onClick={() => {
								dispatch(applyNow())
								onApply?.()
							}}
							className='relative w-[130px] h-[30px] pb-0.5 rounded-[10px] text-white text-[14px] font-baron bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)] overflow-hidden cursor-pointer flex justify-center items-center group'
						>
							<span className='relative z-10'>показать</span>
							<span className='absolute inset-0 rounded-[10px] bg-[#BD52E9] opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100' />
						</button>
					</div>
				</div>
			</div>
		)

		if (embed) {
			return (
				visible && (
					<motion.div
						initial={{ height: 0, opacity: 0, y: -6 }}
						animate={{
							height: isOpen ? H : 0,
							opacity: isOpen ? 1 : 0,
							y: isOpen ? 0 : -6,
						}}
						exit={{ height: 0, opacity: 0, y: -6 }}
						transition={{
							height: { duration: 0.22, ease: 'easeOut' },
							opacity: { duration: 0.18 },
							y: { duration: 0.18 },
						}}
						className='relative w-auto overflow-hidden'
						onAnimationComplete={() => {
							if (!isOpen) setVisible(false)
						}}
					>
						{InnerMobile}
					</motion.div>
				)
			)
		}

		return visible ? InnerMobile : null
	}

	// === STANDALONE (десктоп) ===
	const InnerStandalone = (
		<div
			className={[
				'w-[240px]  h-[834px] rounded-[20px] flex flex-col',
				className,
			].join(' ')}
			style={style}
		>
			{/* header */}
			<div className='px-5 pt-[10px] relative top-[2px]'>
				<div className='text-[#625A51] text-lg font-baron lowercase'>
					фильтры
				</div>

				<button
					type='button'
					onClick={onClose}
					className='absolute top-4 right-5 w-6 h-6 grid place-items-center rounded text-[#625A51] hover:text-[#BD52E9] transition-colors focus:outline-none cursor-pointer'
					aria-label='Закрыть'
					title='Закрыть'
				>
					<svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
						<path
							d='M14.0625 5.9375L5.9375 14.0625M5.9375 5.9375L14.0625 14.0625'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</button>
			</div>
			<div className='w-[220px] h-[2px]  bg-[#EFEBE6] rounded-[20px] mt-2.5 mx-auto' />
			{/* body (как было — скролл) */}
			<div
				className='flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-[10px] pb-2 scroll-smooth scroll-hidden'
				onWheelCapture={e => e.stopPropagation()}
				onTouchMoveCapture={e => e.stopPropagation()}
			>
				{/* …весь твой контент без изменений… */}
				<div className='mt-3'>
					<TagsEditor
						value={toArr(form?.tags)}
						onChange={next => setField('tags', next)}
					/>
				</div>
				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />
				<div className='mt-3'>
					<div className='text-black text-[12px] font-baron mb-2'>Цена</div>
					<div className='mt-3 grid grid-cols-2 gap-[10px]'>
						<BadgeInput
							label='от'
							value={form?.price?.min}
							onChange={v => setField('price.min', v === '' ? '' : Number(v))}
						/>
						<BadgeInput
							label='до'
							value={form?.price?.max}
							onChange={v => setField('price.max', v === '' ? '' : Number(v))}
						/>
					</div>
					<RangeDual
						min={0}
						max={20000}
						step={10}
						valueMin={nnum(form?.price?.min ?? 0)}
						valueMax={nnum(form?.price?.max ?? 20000)}
						onChange={(lo, hi) => {
							setField('price.min', Math.max(0, Math.floor(lo)))
							setField('price.max', Math.max(0, Math.floor(hi)))
						}}
						className='mx-[2px]'
					/>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>
						тип товара
					</div>
					<div className='flex flex-col'>
						{PRODUCT_TYPES.map(t => (
							<WhiteCheckRow
								key={t}
								label={t}
								checked={toArr(form?.types).map(norm).includes(t)}
								onToggle={() => toggleArr('types', t)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>
						производитель
					</div>
					<div className='flex flex-col gap-1'>
						{MANUFACTURERS.map(m => (
							<WhiteCheckRow
								key={m}
								label={m}
								checked={toArr(form?.manufacturers).map(norm).includes(m)}
								onToggle={() => toggleArr('manufacturers', m)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>тип</div>
					<div className='flex flex-col gap-1'>
						{IGNITIONS.map(t => (
							<WhiteCheckRow
								key={t}
								label={t}
								checked={toArr(form?.ignitionType).map(norm).includes(t)}
								onToggle={() => toggleArr('ignitionType', t)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>
						количество хлопков
					</div>
					<div className='flex flex-col gap-1'>
						{SHOTS_PRESETS.map(n => (
							<WhiteCheckRow
								key={n}
								label={String(n)}
								checked={toArr(form?.shots).includes(n)}
								onToggle={() => toggleArr('shots', n)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>
						мощность
					</div>
					<div className='flex flex-col gap-1'>
						{POWERS.map(p => (
							<WhiteCheckRow
								key={p}
								label={p}
								checked={toArr(form?.power).map(norm).includes(p)}
								onToggle={() => toggleArr('power', p)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>вид</div>
					<div className='flex flex-col gap-1'>
						{VIEWS.map(v => (
							<WhiteCheckRow
								key={v}
								label={v}
								checked={toArr(form?.view).map(norm).includes(v)}
								onToggle={() => toggleArr('view', v)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>
						размер
					</div>
					<div className='flex flex-col gap-1'>
						{SIZES.map(s => (
							<WhiteCheckRow
								key={s}
								label={s}
								checked={toArr(form?.size).map(norm).includes(s)}
								onToggle={() => toggleArr('size', s)}
							/>
						))}
					</div>
				</div>

				<div className='my-2'>
					<Divider />
				</div>

				<div>
					<div className='text-black text-[12px] font-baron mb-2 mx-2'>
						время работы
					</div>
					<div className='mt-3 grid grid-cols-2 gap-[10px]'>
						<BadgeInput
							label='от'
							value={form?.time?.min}
							onChange={v => setField('time.min', v === '' ? '' : Number(v))}
						/>
						<BadgeInput
							label='до'
							value={form?.time?.max}
							onChange={v => setField('time.max', v === '' ? '' : Number(v))}
						/>
					</div>
					<RangeDual
						min={0}
						max={120}
						step={1}
						valueMin={nnum(form?.time?.min ?? 0)}
						valueMax={nnum(form?.time?.max ?? 120)}
						onChange={(lo, hi) => {
							setField('time.min', Math.max(0, Math.floor(lo)))
							setField('time.max', Math.max(0, Math.floor(hi)))
						}}
						className='mx-[2px]'
					/>
				</div>
			</div>

			{/* footer */}
			<div className='px-2.5 pb-3 pt-2'>
				<div className='text-center text-zinc-300 text-[12px] font-baron'>
					найден {previewCount} товар
				</div>
				<div className='flex gap-2 mt-2'>
					<button
						type='button'
						onClick={() => {
							dispatch(resetForm())
							onReset?.()
						}}
						className='w-1/2 h-[25px] px-[5px] py-[4px] bg-[#EFEBE6] rounded-[10px] text-[10px] font-baron cursor-pointer hover:text-[#BD52E9]'
					>
						сбросить все
					</button>
					<button
						type='button'
						onClick={() => {
							dispatch(applyNow())
							onApply?.()
						}}
						className='relative w-1/2 h-[25px] cursor-pointer px-[5px] py-[4px] rounded-[10px] text-white text-[10px] font-baron bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)] overflow-hidden'
					>
						<span className='relative z-10'>показать</span>
						<span className='absolute inset-0 rounded-[10px] bg-[#BD52E9] opacity-0 transition-opacity duration-300 hover:opacity-100' />
					</button>
				</div>
			</div>
		</div>
	)

	if (embed) {
		return (
			visible && (
				<motion.div
					initial={{ height: 0, opacity: 0, y: -6 }}
					animate={{ height: isOpen ? H : 0, opacity: isOpen ? 1 : 0 }}
					exit={{ height: 0, opacity: 0, y: -6 }}
					transition={{
						height: { duration: isOpen ? 0.18 : 0.25, ease: 'easeOut' },
						opacity: { duration: isOpen ? 0.18 : 0.2, ease: 'easeOut' },
						y: { duration: 0.18 },
					}}
					className='relative w-[240px]  bg-white rounded-[20px] overflow-hidden'
					onAnimationComplete={() => {
						if (!isOpen) setVisible(false)
					}}
				>
					{InnerStandalone}
				</motion.div>
			)
		)
	}

	return visible ? (
		<div
			className='absolute left-0 top-0 drop-shadow-[0_0_5px_rgba(0,0,0,0.2)] rounded-[20px]'
			style={{ width: W, height: H, pointerEvents: isOpen ? 'auto' : 'none' }}
		>
			<motion.div
				initial={false}
				animate={{ height: isOpen ? H : 0, opacity: isOpen ? 1 : 0 }}
				transition={{
					height: { duration: isOpen ? 0.18 : 0.25, ease: 'easeOut' },
					opacity: { duration: isOpen ? 0.18 : 0.2, ease: 'easeOut' },
				}}
				onAnimationComplete={() => {
					if (!isOpen) setVisible(false)
				}}
				className='relative w-[240px] bg-white rounded-[20px] overflow-hidden'
				style={{ willChange: 'height, opacity' }}
			>
				{InnerStandalone}
			</motion.div>
		</div>
	) : null
}
