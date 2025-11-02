// src/components/Search/SearchBar.jsx
import {
	startTransition,
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useDispatch } from 'react-redux'
import { setSearchQuery } from '../../store/slices/productsSlice'

// Found-поток
import { setCategorySmart } from '../../store/slices/categoriesSlice'
import { clearApplied, setShowFound } from '../../store/slices/filtersSlice'

import forwarding from '../../assets/SVG/forwadding.svg'
import loop from '../../assets/SVG/loop.svg'

const MIN_CHARS = 4
const INSERT_DELAY = 120 // задержка при наборе
const DELETE_DELAY = 320 // задержка при стирании

const SearchBar = ({ className = '' }) => {
	const dispatch = useDispatch()
	const [localQuery, setLocalQuery] = useState('')
	const inputRef = useRef(null)

	// определяем, это вставка или удаление
	const prevValueRef = useRef('')
	const lastChangeTypeRef = useRef('insert') // 'insert' | 'delete'

	const onChange = useCallback(e => {
		const next = e.target.value
		const prev = prevValueRef.current
		const isDelete = next.length < prev.length && prev.startsWith(next)
		lastChangeTypeRef.current = isDelete ? 'delete' : 'insert'
		prevValueRef.current = next
		setLocalQuery(next)
	}, [])

	const deferredQuery = useDeferredValue(localQuery)
	const lastSentRef = useRef('')
	const timerRef = useRef(null)

	const toggleFound = useCallback(
		q => {
			const has = !!String(q).trim()
			if (has) {
				dispatch(clearApplied())
				dispatch(setShowFound(true))
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

	// главный эффект: ставим на таймер разной длины для insert/delete
	useEffect(() => {
		const raw = deferredQuery
		const q = String(raw || '')
		const trimmed = q.trim()

		// антишум: короткие запросы пропускаем (кроме полного очищения)
		const effective =
			trimmed.length >= MIN_CHARS ? trimmed : trimmed.length === 0 ? '' : null
		if (effective === null) return

		// одинаковое значение уже отправляли — выходим
		if (lastSentRef.current === effective) return

		// сбрасываем предыдущий таймер
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}

		// если очищаем строку — можно отправить сразу (ощущается мгновенно)
		if (effective === '') {
			lastSentRef.current = ''
			startTransition(() => {
				dispatch(setSearchQuery(''))
				dispatch(setShowFound(false))
			})
			return
		}

		const delay =
			lastChangeTypeRef.current === 'delete' ? DELETE_DELAY : INSERT_DELAY

		timerRef.current = setTimeout(() => {
			lastSentRef.current = effective
			startTransition(() => {
				dispatch(setSearchQuery(effective))
				toggleFound(effective)
			})
			timerRef.current = null
		}, delay)

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
				timerRef.current = null
			}
		}
	}, [deferredQuery, dispatch, toggleFound])

	const clear = useCallback(() => {
		// ручная очистка — сразу
		setLocalQuery('')
		prevValueRef.current = ''
		lastChangeTypeRef.current = 'delete'
		lastSentRef.current = ''
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
		startTransition(() => {
			dispatch(setSearchQuery(''))
			dispatch(setShowFound(false))
		})
		inputRef.current?.focus()
	}, [dispatch])

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

			{/* очистка (скрыта по макету, поведение оставлено) */}
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
