// src/components/Search/SearchBar.jsx
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchQuery } from '../../store/slices/productsSlice'

// Found-поток
import { setCategorySmart } from '../../store/slices/categoriesSlice'
import { clearApplied, setShowFound } from '../../store/slices/filtersSlice'

import forwarding from '../../assets/SVG/forwadding.svg'
import loop from '../../assets/SVG/loop.svg'

const SearchBar = ({ className = '' }) => {
	const dispatch = useDispatch()
	const [localQuery, setLocalQuery] = useState('')
	const inputRef = useRef(null)

	// debounce диспатча строки поиска
	const debouncedSetQuery = useMemo(
		() =>
			debounce(q => {
				dispatch(setSearchQuery(q))
			}, 300),
		[dispatch]
	)

	// переключение Found-сцены + синхронизация категории
	const toggleFound = useCallback(
		q => {
			const has = !!String(q).trim()
			if (has) {
				// включаем Found, сбрасываем любые глобальные применённые фильтры
				dispatch(clearApplied())
				dispatch(setShowFound(true))
				// чтобы контентная часть не «липла» к подкатегории — ставим "all"
				dispatch(setCategorySmart('all'))
				try {
					window.dispatchEvent(
						new CustomEvent('nav:category-picked', {
							detail: { category: 'all' },
						})
					)
				} catch {}
			} else {
				dispatch(setShowFound(false))
			}
		},
		[dispatch]
	)

	const onChange = useCallback(
		e => {
			const val = e.target.value
			setLocalQuery(val)
			debouncedSetQuery(val)
			toggleFound(val)
		},
		[debouncedSetQuery, toggleFound]
	)

	const clear = useCallback(() => {
		setLocalQuery('')
		debouncedSetQuery.cancel()
		dispatch(setSearchQuery(''))
		dispatch(setShowFound(false))
		inputRef.current?.focus()
	}, [dispatch, debouncedSetQuery])

	// глобальная горячая клавиша: "/" — фокус в поиск
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

	useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery])

	return (
		<div
			className={[
				'relative group flex items-center',
				'border border-[#efebe6] rounded-[20px]',
				'h-[50px] bg-white',
				'w-full min-w-0',
				className,
			].join(' ')}
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
					'min-w-0',
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

			{/* очистка (по макету скрыта, но оставил поведение) */}
			{localQuery && (
				<button
					type='button'
					onClick={clear}
					className='absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hidden hover:bg-black/5 transition-colors duration-150 ease-out'
					aria-label='Очистить'
					title='Очистить'
				>
					×
				</button>
			)}
		</div>
	)
}

export default SearchBar
