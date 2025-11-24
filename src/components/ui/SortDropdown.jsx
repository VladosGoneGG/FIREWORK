// src/components/ui/SortDropdown.jsx
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
	const [hoverIdx, setHoverIdx] = useState(-1) // для ↑/↓
	const rootRef = useRef(null)
	const menuRef = useRef(null)

	const current = useMemo(
		() => options.find(o => o.value === value) || options[0],
		[options, value]
	)

	// клик вне — закрыть
	useEffect(() => {
		const onDocClick = e => {
			if (!rootRef.current) return
			if (!rootRef.current.contains(e.target)) setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [])

	// при открытии выставляем hoverIdx на текущий пункт и скроллим к нему
	useEffect(() => {
		if (!open) return
		const idx = Math.max(
			0,
			options.findIndex(o => o.value === current.value)
		)
		setHoverIdx(idx)
		// мягко проскроллить активный элемент в меню
		requestAnimationFrame(() => {
			const el = menuRef.current?.querySelector(`[data-opt-idx="${idx}"]`)
			if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
		})
	}, [open, options, current.value])

	const commit = val => {
		if (val !== current.value) onChange?.(val)
		setOpen(false)
	}

	const onKeyDownButton = e => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			setOpen(o => !o)
		} else if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (!open) setOpen(true)
			else setHoverIdx(i => Math.min(options.length - 1, i < 0 ? 0 : i + 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			if (!open) setOpen(true)
			else setHoverIdx(i => Math.max(0, i < 0 ? 0 : i - 1))
		} else if (e.key === 'Escape') {
			if (open) {
				e.preventDefault()
				setOpen(false)
			}
		}
	}

	const onKeyDownMenu = e => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			const idx =
				hoverIdx >= 0
					? hoverIdx
					: options.findIndex(o => o.value === current.value)
			const next = options[idx] || current
			commit(next.value)
		} else if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHoverIdx(i => Math.min(options.length - 1, i < 0 ? 0 : i + 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHoverIdx(i => Math.max(0, i < 0 ? 0 : i - 1))
		} else if (e.key === 'Escape') {
			e.preventDefault()
			setOpen(false)
		}
	}

	return (
		<div
			ref={rootRef}
			className={['relative inline-block', className].join(' ')}
		>
			{/* Кнопка (визуал без изменений) */}
			<button
				type='button'
				onClick={() => setOpen(o => !o)}
				onKeyDown={onKeyDownButton}
				aria-haspopup='listbox'
				aria-expanded={open}
				className={[
					'w-[150px] h-[25.5px]   cursor-pointer',
					'rounded-[10px] ring-1 ring-inset ring-[#D9D9D9]',
					'inline-flex items-center justify-center gap-[13px]',
					'bg-white text-[#625A51] text-[10px] font-baron',
					'hover:bg-[#f7f5f3] hover:text-[#BD52E9] active:bg-[#efece7]',
					'transition-colors',
				].join(' ')}
			>
				<p className='truncate pb-[2px]'>{current.label}</p>
				<span className='relative w-[10px] h-[10px] overflow-hidden'>
					<span
						className={[
							'absolute left-[0.83px] top-[2.08px]',
							'w-[8.33px] h-[6.24px]',
							'[clip-path:polygon(50%_0,0_100%,100%_100%)]',
							open ? 'rotate-180' : '',
							'origin-center transition-transform duration-150',
						].join(' ')}
						style={{ backgroundColor: 'currentColor' }}
					/>
				</span>
			</button>

			{/* Меню (визуал без изменений) */}
			{open && (
				<ul
					ref={menuRef}
					role='listbox'
					tabIndex={-1}
					onKeyDown={onKeyDownMenu}
					className={[
						'absolute left-0 top-full mt-1 z-50',
						'w-[150px] rounded-[10px] bg-white',
						'ring-1 ring-inset ring-[#D9D9D9]',
						'shadow-sm overflow-auto max-h-[180px]',
					].join(' ')}
				>
					{options.map((opt, idx) => {
						const active = opt.value === current.value
						const hovered = idx === hoverIdx
						return (
							<li key={opt.value}>
								<button
									type='button'
									role='option'
									aria-selected={active}
									data-opt-idx={idx}
									onMouseEnter={() => setHoverIdx(idx)}
									onClick={() => commit(opt.value)}
									className={[
										'w-full text-left px-3 py-2 cursor-pointer',
										'text-[10px] font-baron',
										active ? 'bg-[#f2efeb] text-black' : 'text-[#625A51]',
										hovered && !active ? 'bg-[#f7f5f3] text-[#BD52E9]' : '',
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
