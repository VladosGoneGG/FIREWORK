import { memo, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_OPTIONS = [
	{ value: 'price-asc', label: 'Сначала недорогие' },
	{ value: 'price-desc', label: 'Сначала дорогие' },
]

function SortDropdown({
	value,
	onChange,
	options = DEFAULT_OPTIONS,
	className = '',
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef(null)
	const current = useMemo(
		() => options.find(o => o.value === value) || options[0],
		[options, value]
	)

	// клик вне — закрыть
	useEffect(() => {
		const onDocClick = e => {
			if (!ref.current) return
			if (!ref.current.contains(e.target)) setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [])

	return (
		<div ref={ref} className={['relative inline-block', className].join(' ')}>
			{/* Кнопка */}
			<button
				type='button'
				onClick={() => setOpen(o => !o)}
				aria-haspopup='listbox'
				aria-expanded={open}
				className={[
					'w-[150px] h-[25px] px-[5px] py-[4px] cursor-pointer',
					'rounded-[10px] ring-1 ring-inset ring-[#D9D9D9]',
					'inline-flex items-center justify-center gap-[13px]',
					// цвет текста = цвет стрелки (т.к. она красится currentColor)
					'bg-white text-[#625A51] text-[10px] font-baron',
					'hover:bg-[#f7f5f3] hover:text-[#BD52E9] active:bg-[#efece7]',
					'transition-colors',
				].join(' ')}
			>
				<span className='truncate'>{current.label}</span>

				{/* Иконка-треугольник: красим фоном currentColor, поэтому меняется вместе с текстом */}
				<span className='relative w-[10px] h-[10px] overflow-hidden'>
					<span
						className={[
							'absolute left-[0.83px] top-[2.08px]',
							'w-[8.33px] h-[6.24px]',
							'[clip-path:polygon(50%_0,0_100%,100%_100%)]', // ▲
							open ? 'rotate-180' : '', // ▼ при открытии
							'origin-center transition-transform duration-150',
						].join(' ')}
						style={{ backgroundColor: 'currentColor' }} // <-- ключ
					/>
				</span>
			</button>

			{/* Меню */}
			{open && (
				<ul
					role='listbox'
					className={[
						'absolute left-0 top-full mt-1 z-50',
						'w-[150px] rounded-[10px] bg-white',
						'ring-1 ring-inset ring-[#D9D9D9]',
						'shadow-sm overflow-hidden',
					].join(' ')}
				>
					{options.map(opt => {
						const active = opt.value === current.value
						return (
							<li key={opt.value}>
								<button
									type='button'
									role='option'
									aria-selected={active}
									onClick={() => {
										onChange?.(opt.value)
										setOpen(false)
									}}
									className={[
										'w-full text-left px-3 py-2 cursor-pointer',
										'text-[10px] font-baron',
										active ? 'bg-[#f2efeb] text-black' : 'text-[#625A51]',
										'hover:bg-[#f7f5f3] hover:text-[#BD52E9] active:bg-[#efece7] transition-colors',
									].join(' ')}
								>
									{opt.label}
								</button>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}

export default memo(SortDropdown)
