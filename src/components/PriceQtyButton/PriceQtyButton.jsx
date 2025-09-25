// src/components/PriceQtyButton/PriceQtyButton.jsx
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	addItem,
	removeItem,
	updateQuantity,
} from '../../store/slices/cartSlice'

const fmtNum = n => new Intl.NumberFormat('ru-RU').format(Math.round(n))

const PriceQtyButton = ({ product, unitPrice, className = '' }) => {
	const dispatch = useDispatch()

	// текущее количество товара в корзине
	const inCartQty =
		useSelector(s => s.cart.items.find(i => i.id === product.id)?.quantity) || 0

	// hover/active-логика по сторонам
	const [hoverSide, setHoverSide] = useState(null) // 'left' | 'right' | null
	const [tapSide, setTapSide] = useState(null) // 'left' | 'right' | null

	// антидребезг, чтобы onTap не срабатывал дважды быстро
	const lockRef = useRef(false)
	const withLock = fn => {
		if (lockRef.current) return
		lockRef.current = true
		try {
			fn()
		} finally {
			setTimeout(() => {
				lockRef.current = false
			}, 120)
		}
	}

	// обработчики +/- (кладём unitPrice в payload)
	const onPlus = () =>
		withLock(() => dispatch(addItem({ ...product, unitPrice })))

	const onMinus = () =>
		withLock(() => {
			if (inCartQty <= 1) {
				if (inCartQty === 1) dispatch(removeItem(product.id))
			} else {
				dispatch(updateQuantity({ id: product.id, quantity: inCartQty - 1 }))
			}
		})

	// фон контейнера (как у тебя, только без влияния на клики)
	let bgClass = 'bg-purple-500'
	if (hoverSide === 'left')
		bgClass = 'bg-gradient-to-r from-violet-300 to-purple-500'
	else if (hoverSide === 'right')
		bgClass = 'bg-gradient-to-r from-purple-500 to-violet-300'
	if (tapSide === 'left')
		bgClass = 'bg-gradient-to-r from-stone-200 to-purple-500'
	else if (tapSide === 'right')
		bgClass = 'bg-gradient-to-r from-purple-500 to-stone-200'

	// сколько показывать в центре
	const qty = Math.max(1, inCartQty || 1)
	const total = typeof unitPrice === 'number' ? unitPrice * qty : null

	return (
		<div
			className={[
				'relative w-48 h-11 rounded-[10px] inline-flex justify-center items-center gap-7 px-3',
				bgClass,
				'transition-[background-color,transform,filter] duration-200 ease-out',
				tapSide ? 'scale-[0.99]' : 'scale-100',
				'select-none font-normal',
				className,
			].join(' ')}
			// сбрасываем состояния когда мышь уходит с кнопки
			onMouseLeave={() => {
				setHoverSide(null)
				setTapSide(null)
			}}
		>
			{/* Полупрозрачные «ховер-зоны» — НЕ перекрывают клики по иконкам */}
			<motion.div
				aria-hidden
				className='pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-l-[10px]'
				initial={false}
				animate={{ opacity: hoverSide === 'left' ? 0.12 : 0 }}
				transition={{ duration: 0.15 }}
			/>
			<motion.div
				aria-hidden
				className='pointer-events-none absolute inset-y-0 right-0 w-1/2 rounded-r-[10px]'
				initial={false}
				animate={{ opacity: hoverSide === 'right' ? 0.12 : 0 }}
				transition={{ duration: 0.15 }}
			/>

			{/* Минус */}
			<motion.button
				type='button'
				whileHover={{ scale: 1.12 }}
				whileTap={{ scale: 0.92 }}
				onHoverStart={() => setHoverSide('left')}
				onHoverEnd={() => setHoverSide(null)}
				onTapStart={() => setTapSide('left')}
				onTapCancel={() => setTapSide(null)}
				onTap={() => {
					setTapSide(null)
					onMinus()
				}}
				aria-label='Уменьшить количество'
				title='Уменьшить количество'
				className={[
					'relative w-5 h-5 grid place-items-center rounded-[6px] cursor-pointer',
					'transition-colors duration-150',
					'font-normal',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
				].join(' ')}
			>
				<div
					className={[
						'w-3 h-[1.67px]',
						tapSide === 'left' ? 'bg-stone-600' : 'bg-white',
						'transition-colors duration-150',
					].join(' ')}
				/>
			</motion.button>

			{/* Центр: итоговая сумма и подпись */}
			<div className='flex flex-col items-center leading-none font-baron cursor-default select-none font-normal'>
				<div className='flex items-baseline gap-1'>
					<span className='text-[20px] leading-none text-white font-normal'>
						{typeof total === 'number' ? fmtNum(total) : '—'}
					</span>
					<span className='text-[12px] leading-none text-white relative top-[2px] lowercase font-normal'>
						руб.
					</span>
				</div>
			</div>

			{/* Плюс */}
			<motion.button
				type='button'
				whileHover={{ scale: 1.12 }}
				whileTap={{ scale: 0.92 }}
				onHoverStart={() => setHoverSide('right')}
				onHoverEnd={() => setHoverSide(null)}
				onTapStart={() => setTapSide('right')}
				onTapCancel={() => setTapSide(null)}
				onTap={() => {
					setTapSide(null)
					onPlus()
				}}
				aria-label='Увеличить количество'
				title='Увеличить количество'
				className={[
					'relative w-5 h-5 grid place-items-center rounded-[6px] cursor-pointer',
					'transition-colors duration-150',
					'font-normal',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
				].join(' ')}
			>
				<div
					className={[
						'absolute w-3 h-[1.67px]',
						tapSide === 'right' ? 'bg-stone-600' : 'bg-white',
						'transition-colors duration-150',
					].join(' ')}
				/>
				<div
					className={[
						'absolute h-3 w-[1.67px]',
						tapSide === 'right' ? 'bg-stone-600' : 'bg-white',
						'transition-colors duration-150',
					].join(' ')}
				/>
			</motion.button>
		</div>
	)
}

export default PriceQtyButton
