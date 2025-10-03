// src/components/SearchHeader/SearchHeader.jsx
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSearchQuery } from '../../store/slices/productsSlice'

import forwarding from '../../assets/SVG/forwadding.svg' // декоративный SVG
import loop from '../../assets/SVG/loop.svg' // иконка лупы

const SearchHeader = () => {
	const dispatch = useDispatch()
	const [localQuery, setLocalQuery] = useState('')

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

	useEffect(() => () => debounced.cancel(), [debounced])

	return (
		<div
			className={`
        relative group flex items-center
        border border-[#efebe6] bg-white rounded-[20px]
        h-[50px]
        w-full max-w-[665px]   
      `}
		>
			{/* Лупа слева */}
			<img
				src={loop}
				alt='Поиск'
				className='absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none'
			/>

			{/* Поле ввода — резиновое, не вылазит за контейнер */}
			<input
				value={localQuery}
				onChange={onChange}
				aria-label='Поиск по товарам'
				placeholder=' '
				className={`cursor-text            
          
          outline-none bg-transparent w-full h-full
          rounded-[20px]  
          pl-11 md:pl-12 pr-3 md:pr-4
          hover:bg-[#efebe6] 
        `}
			/>

			{/* Декоративный SVG-плейсхолдер — скрываем на узких десктопах, прячем при вводе */}
			<img
				src={forwarding}
				alt=''
				aria-hidden='true'
				className={`
          absolute left-11 md:left-12 top-1/2 -translate-y-1/2
          h-[20px]
          transition-opacity duration-150
          ${localQuery ? 'opacity-0' : 'opacity-100'}
          group-focus-within:opacity-0
          pointer-events-none
          hidden lg:block  /* на узких не показываем, чтобы не мешал тексту */
        `}
			/>
		</div>
	)
}

export default SearchHeader
