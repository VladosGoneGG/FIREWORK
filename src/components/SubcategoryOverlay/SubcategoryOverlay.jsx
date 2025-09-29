// src/components/SubcategoryOverlay/SubcategoryOverlay.jsx
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback } from 'react'

// списки значений
const PRODUCT_TYPES = ['дым', 'петарды', 'наземный фейерверк']
const MANUFACTURERS = ['Piroff', 'Joker', 'Maxsem']
const SHOTS_PRESETS = [1, 2, 3, 4]
const POWER_LEVELS = ['слабый', 'средний', 'мощный']

const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
const nnum = v => (Number.isFinite(Number(v)) ? Number(v) : 0)

/* ===== Двойной слайдер цены ===== */
const RangeDual = memo(function RangeDual({
	min = 0,
	max = 20000,
	step = 10,
	valueMin,
	valueMax,
	onChange, // (min, max)
	className = '',
}) {
	const vMin = Math.max(min, Math.min(valueMin ?? min, valueMax ?? max))
	const vMax = Math.min(max, Math.max(valueMax ?? max, valueMin ?? min))
	const pMin = ((vMin - min) / (max - min)) * 100
	const pMax = ((vMax - min) / (max - min)) * 100

	const trackStyle = {
		background: `linear-gradient(
      to right,
      #CCBEFA 0%,
      #CCBEFA ${pMin}%,
      #BF53EA ${pMin}%,
      #BF53EA ${pMax}%,
      #CCBEFA ${pMax}%,
      #CCBEFA 100%
    )`,
	}

	const handleMin = e => {
		const next = Math.min(Number(e.target.value), vMax - step)
		onChange?.(next, vMax)
	}
	const handleMax = e => {
		const next = Math.max(Number(e.target.value), vMin + step)
		onChange?.(vMin, next)
	}

	return (
		<div className={['relative w-full h-5', className].join(' ')}>
			<div
				className='absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-[20px]'
				style={trackStyle}
			/>
			<div
				className='absolute -translate-x-1/2 top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] pointer-events-none'
				style={{ left: `${pMin}%` }}
			/>
			<div
				className='absolute -translate-x-1/2 top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] pointer-events-none'
				style={{ left: `${pMax}%` }}
			/>
			<input
				type='range'
				min={min}
				max={max}
				step={step}
				value={vMin}
				onChange={handleMin}
				className='absolute top-0 bottom-0 appearance-none bg-transparent cursor-pointer'
				style={{ left: 0, right: `${100 - pMax}%`, accentColor: '#BF53EA' }}
				aria-label='Минимальная цена'
			/>
			<input
				type='range'
				min={min}
				max={max}
				step={step}
				value={vMax}
				onChange={handleMax}
				className='absolute top-0 bottom-0 appearance-none bg-transparent cursor-pointer'
				style={{ left: `${pMin}%`, right: 0, accentColor: '#BF53EA' }}
				aria-label='Максимальная цена'
			/>
		</div>
	)
})

/* ===== Мелкие компоненты ===== */
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

function WhiteCheckRow({ label, checked, onToggle }) {
	return (
		<button
			type='button'
			onClick={onToggle}
			className={[
				'w-full h-[24px] px-2',
				'bg-white',
				checked ? 'ring-[#BD52E9]' : 'ring-[#D9D9D9]',
				'flex items-center gap-2 text-[10px] font-baron text-black',
				'active:bg-[#efece7] transition',
			].join(' ')}
			aria-pressed={checked}
			title={label}
		>
			<span
				className={[
					'w-[10px] h-[10px] rounded-full border cursor-pointer',
					checked
						? 'bg-[#BD52E9] border-[#BD52E9]'
						: 'bg-white border-[#D9D9D9]',
				].join(' ')}
			/>
			<span className='truncate'>{label}</span>
		</button>
	)
}

/* ===== Анимация только для панели (без портала и позиционирования) ===== */
const variants = {
	closed: {
		opacity: 0,
		clipPath: 'inset(0 0 100% 0 round 20px)',
		transition: { duration: 0.14, ease: 'easeIn' },
	},
	open: {
		opacity: 1,
		clipPath: 'inset(0 0 0% 0 round 20px)',
		transition: { duration: 0.18, ease: 'easeOut' },
	},
}

/* ========================= Основной компонент ========================= */
export default function SubcategoryOverlay({
	isOpen,
	onApply,
	onReset,
	onClose,
	resultsCount = 0,
	form,
	setField,
	className = '', // <- пусть родитель задаёт позицию/размер (absolute/fixed/left/top)
	style = {}, // <- и inline-стили при необходимости
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

	return (
		<AnimatePresence initial={false}>
			{isOpen && (
				<motion.div
					key='overlay'
					variants={variants}
					initial='closed'
					animate='open'
					exit='closed'
					className={[
						'pointer-events-auto w-[240px] h-[834px] bg-white rounded-[20px]',
						'shadow-[0_0_10px_0_rgba(0,0,0,0.20)] overflow-hidden flex flex-col',
						className,
					].join(' ')}
					style={style}
				>
					{/* header */}
					<div className='px-5 pt-4 pb-2 relative top-[2px]'>
						<div className='text-[#625A51] text-lg font-baron lowercase'>
							фильтры
						</div>
						<div className='w-[204px] h-[2px] bg-[#EFEBE6] rounded-[20px] mt-2 mx-auto' />
						<button
							type='button'
							onClick={onClose}
							className='absolute top-2 right-2 w-6 h-6 grid place-items-center rounded text-[#625A51] hover:text-[#BD52E9] transition-colors focus:outline-none cursor-pointer'
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
						className='flex-1 min-h-0
    overflow-y-auto overscroll-contain touch-pan-y
    px-[18px] pb-2
    scroll-smooth scroll-hidden'
						onWheelCapture={e => e.stopPropagation()}
						onTouchMoveCapture={e => e.stopPropagation()}
					>
						{/* Цена */}
						<div className='mt-4'>
							<div className='text-black text-[12px] font-baron mb-2'>Цена</div>
							<RangeDual
								min={0}
								max={20000}
								step={10}
								valueMin={priceMin}
								valueMax={priceMax}
								onChange={onPriceChange}
								className='mx-[2px]'
							/>
							<div className='mt-3 grid grid-cols-2 gap-[10px]'>
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
						</div>

						<div className='my-4'>
							<Divider />
						</div>

						{/* Тип товара */}
						<div className='mt-2'>
							<div className='text-black text-[12px] font-baron mb-2'>
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

						<div className='my-4'>
							<Divider />
						</div>

						{/* Производитель */}
						<div className='mt-2'>
							<div className='text-black text-[12px] font-baron mb-2'>
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

						<div className='my-4'>
							<Divider />
						</div>

						{/* Количество хлопков */}
						<div className='mt-2'>
							<div className='text-black text-[12px] font-baron mb-2'>
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

						<div className='my-4'>
							<Divider />
						</div>

						{/* Мощность */}
						<div className='mt-2'>
							<div className='text-black text-[12px] font-baron mb-2'>
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

						<div className='my-4'>
							<Divider />
						</div>

						{/* Дополнительно */}
						<div className='mt-2'>
							<div className='text-black text-[12px] font-baron mb-2'>
								дополнительно
							</div>
							<div className='flex flex-col gap-1'>
								<WhiteCheckRow
									label='только в наличии'
									checked={!!form?.inStockOnly}
									onToggle={() => setField?.('inStockOnly', !form?.inStockOnly)}
								/>
								<WhiteCheckRow
									label='есть сертификат'
									checked={!!form?.hasCertificate}
									onToggle={() =>
										setField?.('hasCertificate', !form?.hasCertificate)
									}
								/>
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
								className='w-1/2 h-[25px] px-[5px] py-[4px] bg-[#EFEBE6] rounded-[10px] text-[10px] font-baron'
							>
								сбросить все
							</button>
							<button
								type='button'
								onClick={onApply}
								className='w-1/2 h-[25px] px-[5px] py-[4px] rounded-[10px] text-white text-[10px] font-baron
                bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)]
                hover:opacity-95 active:opacity-90 transition-colors'
							>
								показать
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
