import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	clearSearchQuery,
	setSearchQuery,
} from '../../store/slices/productsSlice'
import { getSuggestions } from '../../utils/search'

const SearchModal = ({
	isOpen,
	onClose,
	onSelectProduct, // (product) => void | необязателен: если не передан, просто ставим query и закрываем
}) => {
	const dispatch = useDispatch()
	const items = useSelector(s => s.products.items)

	const [q, setQ] = useState('')
	const [idx, setIdx] = useState(0)
	const inputRef = useRef(null)
	const listRef = useRef(null)

	const suggestions = useMemo(
		() => (q ? getSuggestions(items, q, 12) : []),
		[items, q]
	)

	useEffect(() => {
		if (!isOpen) return
		setQ('')
		setIdx(0)
		const onKey = e => {
			if (e.key === 'Escape') onClose?.()
			if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault()
				onClose?.()
			}
		}
		const focusTimer = setTimeout(() => inputRef.current?.focus(), 0)
		window.addEventListener('keydown', onKey)
		return () => {
			clearTimeout(focusTimer)
			window.removeEventListener('keydown', onKey)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const selectCurrent = p => {
		if (onSelectProduct && p) {
			onSelectProduct(p) // откроешь карточку товара, если передан колбэк
			dispatch(clearSearchQuery())
			onClose?.()
		} else {
			dispatch(setSearchQuery(q)) // иначе — просто применяем поиск
			onClose?.()
		}
	}

	return (
		<div
			className='fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]'
			onClick={onClose}
		>
			<div
				className='
          absolute left-1/2 top-24 -translate-x-1/2
          w-[720px] bg-white rounded-[14px] shadow-xl
          overflow-hidden
        '
				onClick={e => e.stopPropagation()}
			>
				<div className='p-3 border-b border-[#efebe6]'>
					<input
						ref={inputRef}
						value={q}
						onChange={e => {
							setQ(e.target.value)
							setIdx(0)
						}}
						onKeyDown={e => {
							if (e.key === 'ArrowDown') {
								e.preventDefault()
								setIdx(i =>
									Math.min(i + 1, Math.max(0, suggestions.length - 1))
								)
							} else if (e.key === 'ArrowUp') {
								e.preventDefault()
								setIdx(i => Math.max(i - 1, 0))
							} else if (e.key === 'Enter') {
								e.preventDefault()
								selectCurrent(suggestions[idx])
							}
						}}
						placeholder='Поиск по товарам…'
						className='w-full h-12 px-4 rounded-[10px] bg-[#f6f4f2] outline-none'
					/>
				</div>

				<div
					ref={listRef}
					className='max-h-[420px] overflow-y-auto divide-y divide-[#efebe6]'
				>
					{q && suggestions.length === 0 && (
						<div className='p-4 text-sm text-[#625a51]'>Ничего не найдено</div>
					)}

					{suggestions.map((p, i) => {
						const active = i === idx
						return (
							<button
								key={p.id}
								type='button'
								onClick={() => selectCurrent(p)}
								onMouseEnter={() => setIdx(i)}
								className={`
                  w-full text-left flex items-center gap-3 p-3
                  ${active ? 'bg-[#efebe6]' : 'bg-white hover:bg-[#f6f4f2]'}
                `}
							>
								<div className='w-12 h-12 rounded-[8px] bg-[#f2f0ed] overflow-hidden grid place-items-center'>
									{p.images?.[0] ? (
										<img
											src={p.images[0]}
											alt={p.name}
											className='w-full h-full object-cover'
										/>
									) : (
										<span className='text-xs opacity-60'>—</span>
									)}
								</div>
								<div className='flex-1 min-w-0'>
									<div className='font-medium truncate'>{p.name}</div>
									<div className='text-xs text-[#625a51] truncate'>
										{p.manufacturer}
									</div>
								</div>
								<div className='text-xs text-[#625a51]'>{p.category}</div>
							</button>
						)
					})}
				</div>

				<div className='px-3 py-2 text-[11px] text-[#625a51] bg-[#faf8f6] flex justify-between'>
					<div>Enter — открыть / Esc — закрыть</div>
				</div>
			</div>
		</div>
	)
}

export default SearchModal
