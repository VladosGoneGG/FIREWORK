// src/components/Search/SearchBar.jsx
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchQuery } from '../../store/slices/productsSlice'

import forwarding from '../../assets/SVG/forwadding.svg'
import loop from '../../assets/SVG/loop.svg'

const SearchBar = ({ onOpenModal, className = '' }) => {
	const dispatch = useDispatch()
	const [localQuery, setLocalQuery] = useState('')
	const inputRef = useRef(null)

	const debounced = useMemo(
		() => debounce(q => dispatch(setSearchQuery(q)), 300),
		[dispatch]
	)

	const onChange = useCallback(
		e => {
			const val = e.target.value
			setLocalQuery(val)
			debounced(val)
		},
		[debounced]
	)

	const clear = useCallback(() => {
		setLocalQuery('')
		dispatch(setSearchQuery(''))
		inputRef.current?.focus()
	}, [dispatch])

	useEffect(() => {
		const onKey = e => {
			if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
				const tag = (e.target?.tagName || '').toLowerCase()
				if (tag !== 'input' && tag !== 'textarea') {
					e.preventDefault()
					inputRef.current?.focus()
				}
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [])

	useEffect(() => () => debounced.cancel(), [debounced])

	return (
		<div
			className={[
				'relative group flex items-center',
				'border border-[#efebe6] rounded-[20px]',
				'h-[50px] bg-white',
				'w-full min-w-0', // ← РЕЗИНА: никаких w-[665px]
				// 'max-[1040px]:max-w-[600px]'   // ← удалить жёсткий max-width
				className,
			].join(' ')}
			onClick={e => {
				const rect = e.currentTarget.getBoundingClientRect()
				if (e.clientX - rect.left > rect.width - 60) onOpenModal?.()
			}}
		>
			<img
				src={loop}
				alt='Поиск'
				className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none'
			/>

			<input
				ref={inputRef}
				value={localQuery}
				onChange={onChange}
				aria-label='Поиск по товарам'
				className={[
					'outline-none bg-transparent w-full h-full',
					'pl-12 pr-16 rounded-[20px]',
					'hover:bg-[#efebe6] max-[1040px]:hover:bg-transparent',
					'cursor-text hover:!cursor-pointer focus:!cursor-text',
					'transition-colors duration-150 ease-out',
					'min-w-0', // ← важно, чтобы поле тоже сжималось
				].join(' ')}
			/>

			{/* плейсхолдер-иконка */}
			<img
				src={forwarding}
				alt='Салют на свадьбу'
				className={[
					'absolute left-12 bottom-[8px] -translate-y-1/2 h-[14px]',
					'transition-opacity duration-150 ease-out',
					localQuery ? 'opacity-0' : 'opacity-100',
					'group-focus-within:opacity-0',
					'pointer-events-none',
				].join(' ')}
			/>

			{/* clear (скрыт по макету) */}
			{localQuery && (
				<button
					type='button'
					onClick={clear}
					className='absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hidden hover:bg-black/5 transition-colors duration-150 ease-out'
					aria-label='Очистить'
					title='Очистить'
				>
					×
				</button>
			)}

			{/* «расширенный» — модалка */}
			<button
				type='button'
				onClick={onOpenModal}
				className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-[10px] bg-[#efebe6] hidden hover:bg-[#e6e2dd] font-baron lowercase transition-colors duration-150 ease-out'
				title='Открыть глобальный поиск'
			>
				поиск
			</button>
		</div>
	)
}

export default SearchBar
