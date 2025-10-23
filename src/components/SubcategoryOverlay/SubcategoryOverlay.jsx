// src/components/SubcategoryOverlay/SubcategoryOverlay.jsx
import { motion } from 'framer-motion'
import React, { memo, useCallback } from 'react'

const PRODUCT_TYPES = ['дым', 'петарды', 'наземный фейерверк']
const MANUFACTURERS = ['Piroff', 'Joker', 'Maxsem']
const SHOTS_PRESETS = [1, 2, 3, 4]
const POWER_LEVELS = ['слабый', 'средний', 'мощный']

const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
const nnum = v => (Number.isFinite(Number(v)) ? Number(v) : 0)

/* ===== чекбокс-строка (моб. размер) ===== */
function WhiteCheckRow({ label, checked, onToggle }) {
	const [hover, setHover] = React.useState(false)
	const [active, setActive] = React.useState(false)

	const COLOR_BASE_BG = '#EFEBE6'
	const COLOR_HOVER_CENTER = 'rgba(153,125,245,0.5)'
	const COLOR_ACTIVE_BORDER = '#BD52E9'
	const COLOR_CHECKED_CENTER = '#BF53EA'
	const COLOR_HOVER_CHECKED_CENTER = '#BD52E9'
	const COLOR_HOVER_CHECKED_BORDER = 'rgba(153,125,245,0.5)'

	let dotSize = 10
	let dotColor = COLOR_BASE_BG

	if (!checked) {
		if (hover) {
			dotSize = 8 // чуть крупнее на мобе для читаемости
			dotColor = COLOR_HOVER_CENTER
		}
	} else {
		dotSize = 8
		dotColor = hover ? COLOR_HOVER_CHECKED_CENTER : COLOR_CHECKED_CENTER
	}

	let outerBorderClass = 'border-0'
	let outerBorderStyle = {}
	if (checked && hover) {
		outerBorderClass = 'border-2'
		outerBorderStyle.borderColor = COLOR_HOVER_CHECKED_BORDER
	}
	if (active) {
		outerBorderClass = 'border-2'
		outerBorderStyle.borderColor = COLOR_ACTIVE_BORDER
	}

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
			<span
				className={[
					'shrink-0 grid place-items-center',
					'w-[14px] h-[14px] rounded-full bg-white',
					outerBorderClass,
				].join(' ')}
				style={outerBorderStyle}
			>
				<span
					style={{
						width: Math.max(6, dotSize),
						height: Math.max(6, dotSize),
						background: dotColor,
						borderRadius: '50%',
						transition:
							'width .12s ease, height .12s ease, background-color .12s ease, background .12s ease',
					}}
				/>
			</span>
			<span className='truncate'>{label}</span>
		</button>
	)
}

/* ===== двойной слайдер (204px трек из макета) ===== */
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
			if (thumb === 'min') onChange?.(Math.min(val, vMax - step), vMax)
			else onChange?.(vMin, Math.max(val, vMin + step))
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
		if (distToMin <= distToMax) onChange?.(Math.min(val, vMax - step), vMax)
		else onChange?.(vMin, Math.max(val, vMin + step))
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
				<div className='absolute top-1/2 -translate-y-1/2 w-full h-[2px] rounded-[20px] bg-[#CCBEFA]' />
				<div
					className='absolute top-1/2 -translate-y-1/2 h-[2px] rounded-[20px] bg-[#BF53EA]'
					style={{
						left: `${(pMin / 100) * TRACK_W}px`,
						width: `${((pMax - pMin) / 100) * TRACK_W}px`,
						transition: 'left .12s ease, width .12s ease',
					}}
				/>
				<button
					type='button'
					data-thumb='min'
					aria-label='Минимальная цена'
					className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] shadow-sm cursor-pointer'
					style={{
						left: `${(pMin / 100) * TRACK_W}px`,
						transition: 'left .12s ease',
					}}
					onPointerDown={startDrag('min')}
				/>
				<button
					type='button'
					data-thumb='max'
					aria-label='Максимальная цена'
					className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] shadow-sm cursor-pointer'
					style={{
						left: `${(pMax / 100) * TRACK_W}px`,
						transition: 'left .12s ease',
					}}
					onPointerDown={startDrag('max')}
				/>
			</div>
		</div>
	)
})

/* ===== мелкие компоненты ===== */
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

/* ===== основной компонент ===== */
export default function SubcategoryOverlay({
	variant = 'standalone', // 'mobile' | 'standalone'
	isOpen,
	onApply,
	onReset,
	onClose,
	resultsCount = 0,
	form,
	setField,
	className = '',
	style = {},
	embed = false, // для аккордеона
}) {
	const priceMin = nnum(form?.price?.min ?? 0)
	const priceMax = nnum(form?.price?.max ?? 20000)

	const onPriceChange = useCallback(
		(lo, hi) => {
			setField?.('price.min', Math.max(0, Math.floor(lo)))
			setField?.('price.max', Math.max(0, Math.floor(hi)))
		},
		[setField]
	)

	const toggleArr = useCallback(
		(field, val) => {
			const arr = toArr(form?.[field])
			const next = arr.includes(val)
				? arr.filter(x => x !== val)
				: [...arr, val]
			setField?.(field, next)
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

	// === MOBILE VARIANT (без шапки/крестика, точные отступы макета) ===
	if (variant === 'mobile') {
		const InnerMobile = (
			<div
				className={[
					'w-auto h-[834px] rounded-[20px] flex flex-col',
					' bg-white ',
					className,
				].join(' ')}
				style={style}
			>
				{/* верхний блок с тонкой полосой как в макете */}
				<div className='self-stretch px-3.5 flex flex-col gap-[5px]'>
					{/* тут намеренно НЕТ заголовка и крестика */}
					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />
				</div>

				{/* тело */}
				<div className='self-stretch px-5 pb-2.5 relative bg-white flex-1 flex flex-col gap-2 overflow-hidden min-h-0'>
					{/* Цена */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-sm font-baron'>Цена</div>
						<div className='inline-flex items-center gap-2.5'>
							<BadgeInput
								label='от'
								value={form?.price?.min}
								onChange={v =>
									setField?.('price.min', v === '' ? '' : Number(v))
								}
							/>
							<BadgeInput
								label='до'
								value={form?.price?.max}
								onChange={v =>
									setField?.('price.max', v === '' ? '' : Number(v))
								}
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

					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />

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
									checked={toArr(form?.types).includes(t)}
									onToggle={() => toggleArr('types', t)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Производитель */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>
							ПРоизводитель
						</div>
						<div className='flex flex-col gap-1'>
							{MANUFACTURERS.map(m => (
								<WhiteCheckRow
									key={m}
									label={m}
									checked={toArr(form?.manufacturers).includes(m)}
									onToggle={() => toggleArr('manufacturers', m)}
								/>
							))}
						</div>
					</div>

					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Кол-во хлопков */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>Хлопки</div>
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

					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />

					{/* Мощность */}
					<div className='flex flex-col gap-2'>
						<div className='text-[#625A51] text-base font-baron'>мощность</div>
						<div className='flex flex-col gap-1'>
							{POWER_LEVELS.map(p => (
								<WhiteCheckRow
									key={p}
									label={p}
									checked={toArr(form?.power).includes(p)}
									onToggle={() => toggleArr('power', p)}
								/>
							))}
						</div>
					</div>

					{/* Прокрутка, если не влезло */}
					<div className='flex-1 min-h-0' />
				</div>

				{/* футер */}
				<div className='self-stretch flex flex-col items-center gap-2.5 px-2.5'>
					<div className='text-center text-zinc-300 text-xs font-baron'>
						найден {resultsCount} товар
					</div>
					<div className='w-full inline-flex items-start gap-2.5'>
						<button
							type='button'
							onClick={onReset}
							className='flex-1 w-[130px] h-[30px]   bg-[#EFEBE6] rounded-[10px] text-black text-sm font-baron cursor-pointer hover:text-[#BD52E9]'
						>
							сбросить все
						</button>
						<button
							type='button'
							onClick={onApply}
							className='relative flex-1 w-[130px] h-[30px]   rounded-[10px] text-white text-sm font-baron bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)] overflow-hidden cursor-pointer'
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
						className='relative w-auto rounded-[20px] overflow-hidden'
						onAnimationComplete={() => {
							if (!isOpen) setVisible(false)
						}}
					>
						{InnerMobile}
					</motion.div>
				)
			)
		}

		// mobile без аккордеона — просто блок
		return visible ? InnerMobile : null
	}

	// === STANDALONE (старое поведение с заголовком/крестиком) ===
	const InnerStandalone = (
		<div
			className={[
				'w-[240px] h-[834px] rounded-[20px] flex flex-col',
				className,
			].join(' ')}
			style={style}
		>
			{/* header */}
			<div className='px-5 pt-[10px] relative top-[2px]'>
				<div className='text-[#625A51] text-lg font-baron lowercase'>
					фильтры
				</div>
				<div className='w-[204px] h-[3px] bg-[#EFEBE6] rounded-[20px] mt-2.5 mx-auto' />
				<button
					type='button'
					onClick={onClose}
					className='absolute top-4 right-5 w-6 h-6 grid place-items-center rounded text-[#625A51] hover:text-[#BD52E9] transition-colors focus:outline-none cursor-pointer'
					aria-label='Закрыть'
					title='Закрыть'
				>
					<svg
						width='20'
						height='20'
						viewBox='0 0 20 20'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						className='pointer-events-none'
					>
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

			{/* body */}
			<div
				className='flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-[10px] pb-2 scroll-smooth scroll-hidden'
				onWheelCapture={e => e.stopPropagation()}
				onTouchMoveCapture={e => e.stopPropagation()}
			>
				<div className='mt-3'>
					<div className='text-black text-[12px] font-baron mb-2'>Цена</div>
					<div className='mt-3 grid grid-cols-2 gap-[10px]'>
						<BadgeInput
							label='от'
							value={form?.price?.min}
							onChange={v => setField?.('price.min', v === '' ? '' : Number(v))}
						/>
						<BadgeInput
							label='до'
							value={form?.price?.max}
							onChange={v => setField?.('price.max', v === '' ? '' : Number(v))}
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
								checked={toArr(form?.types).includes(t)}
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
								checked={toArr(form?.manufacturers).includes(m)}
								onToggle={() => toggleArr('manufacturers', m)}
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
						{POWER_LEVELS.map(p => (
							<WhiteCheckRow
								key={p}
								label={p}
								checked={toArr(form?.power).includes(p)}
								onToggle={() => toggleArr('power', p)}
							/>
						))}
					</div>
				</div>
			</div>

			{/* footer */}
			<div className='px-2.5 pb-3 pt-2'>
				<div className='text-center text-zinc-300 text-[8px] font-baron'>
					найдено {resultsCount} товар(ов)
				</div>
				<div className='flex gap-2 mt-2'>
					<button
						type='button'
						onClick={onReset}
						className='w-1/2 h-[25px] px-[5px] py-[4px] bg-[#EFEBE6] rounded-[10px] text-[10px] font-baron cursor-pointer hover:text-[#BD52E9]'
					>
						сбросить все
					</button>
					<button
						type='button'
						onClick={onApply}
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
						height: { duration: 0.22, ease: 'easeOut' },
						opacity: { duration: 0.18 },
						y: { duration: 0.18 },
					}}
					className='relative w-[240px] bg-white rounded-[20px] overflow-hidden'
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
