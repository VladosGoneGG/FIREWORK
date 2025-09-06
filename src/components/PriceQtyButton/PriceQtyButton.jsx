// src/components/PriceQtyButton/PriceQtyButton.jsx
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	addItem,
	removeItem,
	updateQuantity,
} from '../../store/slices/cartSlice'

const fmtNum = n => new Intl.NumberFormat('ru-RU').format(n)

const PriceQtyButton = ({ product, unitPrice, className = '' }) => {
	const dispatch = useDispatch()
	const inCartQty =
		useSelector(s => s.cart.items.find(i => i.id === product.id)?.quantity) || 0

	const [hoverSide, setHoverSide] = useState(null) // 'left' | 'right' | null
	const [activeSide, setActiveSide] = useState(null) // 'left' | 'right' | null

	const onPlus = e => {
		e.stopPropagation()
		dispatch(addItem(product))
	}

	const onMinus = e => {
		e.stopPropagation()
		if (inCartQty <= 1) {
			if (inCartQty === 1) dispatch(removeItem(product.id))
			return
		}
		dispatch(updateQuantity({ id: product.id, quantity: inCartQty - 1 }))
	}

	// фон контейнера в зависимости от наведения/клика именно на сторону
	let bgClass = 'bg-purple-500'
	if (hoverSide === 'left') {
		bgClass = 'bg-gradient-to-r from-violet-300 to-purple-500'
	} else if (hoverSide === 'right') {
		bgClass = 'bg-gradient-to-r from-purple-500 to-violet-300'
	}
	if (activeSide === 'left') {
		bgClass = 'bg-gradient-to-r from-stone-200 to-purple-500'
	} else if (activeSide === 'right') {
		bgClass = 'bg-gradient-to-r from-purple-500 to-stone-200'
	}

	return (
		<div
			className={[
				'relative w-48 h-11 rounded-[10px] inline-flex justify-center items-center gap-7 px-3',
				bgClass,
				// лёгкая анимация всей кнопки при hover
				'hover:animate-wiggle-subtle motion-reduce:animate-none',
				'transition-[background-color,transform,filter] duration-200 ease-out',
				activeSide ? 'scale-[0.99]' : 'scale-100',
				'select-none font-normal', // ничего не жирнеет
				className,
			].join(' ')}
		>
			{/* Минус */}
			<button
				type='button'
				onClick={onMinus}
				onMouseEnter={() => setHoverSide('left')}
				onMouseLeave={() => setHoverSide(null)}
				onMouseDown={() => setActiveSide('left')}
				onMouseUp={() => setActiveSide(null)}
				onBlur={() => setActiveSide(null)}
				aria-label='Уменьшить количество'
				title='Уменьшить количество'
				className={[
					'relative w-5 h-5 grid place-items-center rounded-[6px]',

					'transition-colors duration-150',
					'font-normal',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
				].join(' ')}
			>
				<div
					className={[
						'w-3 h-[1.67px]',
						activeSide === 'left' ? 'bg-stone-600' : 'bg-white',
						'transition-colors duration-150',
					].join(' ')}
				/>
			</button>

			<div className='flex items-baseline gap-1 font-baron cursor-default select-none font-normal'>
				<span className='text-[18px] leading-none text-white font-normal'>
					{typeof unitPrice === 'number' ? fmtNum(unitPrice) : '—'}
				</span>
				<span className='text-[8px] leading-none text-white relative top-[2px] lowercase font-normal'>
					руб.
				</span>
			</div>

			{/* Плюс */}
			<button
				type='button'
				onClick={onPlus}
				onMouseEnter={() => setHoverSide('right')}
				onMouseLeave={() => setHoverSide(null)}
				onMouseDown={() => setActiveSide('right')}
				onMouseUp={() => setActiveSide(null)}
				onBlur={() => setActiveSide(null)}
				aria-label='Увеличить количество'
				title='Увеличить количество'
				className={[
					'relative w-5 h-5 grid place-items-center rounded-[6px]',
					'transition-colors duration-150',
					'font-normal',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
				].join(' ')}
			>
				<div
					className={[
						'absolute w-3 h-[1.67px]',
						activeSide === 'right' ? 'bg-stone-600' : 'bg-white',
						'transition-colors duration-150',
					].join(' ')}
				/>
				<div
					className={[
						'absolute h-3 w-[1.67px]',
						activeSide === 'right' ? 'bg-stone-600' : 'bg-white',
						'transition-colors duration-150',
					].join(' ')}
				/>
			</button>
		</div>
	)
}

export default PriceQtyButton
