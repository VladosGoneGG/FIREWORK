// src/components/SearchBar/SearchBar.jsx
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchQuery } from '../../store/slices/productsSlice'

import forwarding from '../../assets/SVG/forwadding.svg'
import loop from '../../assets/SVG/loop.svg'

// Модалки больше нет — проп onOpenModal удалён
const SearchBar = () => {
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

	// хоткей "/" — фокус на поле
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
			className='
        relative group flex items-center
        border border-[#efebe6] rounded-[20px]
        bg-white h-[50px]

        /* АДАПТИВ: поле резиновое, но не шире исходных 665px */
        w-full max-w-[665px]
      '
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
				className='
          outline-none bg-transparent w-full h-full
          pl-12 pr-16 rounded-[20px]
          hover:bg-[#efebe6]

          /* курсор как просили */
          cursor-text
          hover:!cursor-pointer
          focus:!cursor-text

          /* плавная анимация ховера */
          transition-colors duration-150 ease-out
        '
			/>

			{/* плейсхолдер-иконка, когда пусто */}
			<img
				src={forwarding}
				alt='Салют на свадьбу'
				className={`
          absolute left-12 bottom-[8px] -translate-y-1/2 h-[14px]
          transition-opacity duration-150 ease-out
          ${localQuery ? 'opacity-0' : 'opacity-100'}
          group-focus-within:opacity-0
          pointer-events-none
        `}
			/>

			{/* clear — оставляю ваши стили; сделал видимым на md+, чтобы на мобиле не мешал */}
			{localQuery && (
				<button
					type='button'
					onClick={clear}
					className='
            absolute right-3 top-1/2 -translate-y-1/2
            w-6 h-6 rounded-full md:flex items-center justify-center hidden
            hover:bg-black/5
            transition-colors duration-150 ease-out
          '
					aria-label='Очистить'
					title='Очистить'
				>
					×
				</button>
			)}

			{/* кнопка "поиск" и клики по правой части — УДАЛЕНО, модалки больше нет */}
		</div>
	)
}

export default SearchBar
