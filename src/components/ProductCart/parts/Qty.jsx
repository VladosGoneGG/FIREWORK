// src/components/ProductCart/parts/Qty.jsx
import { motion } from 'motion/react'
import { memo, useState } from 'react'

// =============================
// Константы градиентов
// =============================
const GRADIENTS = {
	leftHover: 'linear-gradient(270deg, #efebe6 0%, #ccbefa 100%)',
	rightHover: 'linear-gradient( 90deg, #efebe6 0%, #ccbefa 100%)',
	leftActive: 'linear-gradient(270deg, #efebe6 0%, #ffffff 100%)',
	rightActive: 'linear-gradient( 90deg, #efebe6 0%, #ffffff 100%)',
}

const Qty = ({ value, onDec, onInc, className = '' }) => {
	const [hoverSide, setHoverSide] = useState(null) // 'left' | 'right' | null
	const [activeSide, setActiveSide] = useState(null) // 'left' | 'right' | null

	const bgLeft = activeSide === 'left' ? GRADIENTS.leftActive : GRADIENTS.leftHover
	const bgRight = activeSide === 'right' ? GRADIENTS.rightActive : GRADIENTS.rightHover

	return (
		<div
			className={[
				'relative inline-flex items-center justify-center',
				'w-[50px] h-[20px] rounded-[10px] bg-[#EFEBE6] overflow-hidden',
				'gap-[7px]', // визуальный отступ от цифры до знаков
				'font-baron lowercase select-none',
				className,
			].join(' ')}
			onMouseLeave={() => {
				setHoverSide(null)
				setActiveSide(null)
			}}
		>
			{/* подсветка половинок */}
			<motion.div
				initial={false}
				animate={{ opacity: hoverSide === 'left' ? 1 : 0 }}
				transition={{ duration: 0.18, ease: 'easeOut' }}
				className='absolute top-0 left-0 h-full w-1/2 rounded-l-[10px] pointer-events-none'
				style={{ background: bgLeft }}
			/>
			<motion.div
				initial={false}
				animate={{ opacity: hoverSide === 'right' ? 1 : 0 }}
				transition={{ duration: 0.18, ease: 'easeOut' }}
				className='absolute top-0 right-0 h-full w-1/2 rounded-r-[10px] pointer-events-none'
				style={{ background: bgRight }}
			/>

			{/* МИНУС — теперь с квадратом-спейсером и центрированной полоской */}
			<motion.button
				type='button'
				onClick={onDec}
				onMouseEnter={() => setHoverSide('left')}
				onMouseDown={() => setActiveSide('left')}
				onMouseUp={() => setActiveSide(null)}
				onBlur={() => setActiveSide(null)}
				whileHover={{ scale: 1.15 }}
				whileTap={{ scale: 0.92 }}
				transition={{ duration: 0.12 }}
				className='relative z-10 inline-flex items-center justify-center p-[6px] -mx-[6px] -my-[6px] cursor-pointer'
				aria-label='Уменьшить'
				title='Уменьшить'
			>
				{/* горизонтальная черта по центру квадрата */}
				<motion.span
					className='absolute left-1/2 top-1/2 w/[7.58px] h/[1.08px] rounded-[1px] -translate-x-1/2 -translate-y-1/2'
					style={{ width: '7.58px', height: '1.08px' }}
					animate={{
						backgroundColor: hoverSide === 'left' ? '#BD52E9' : '#625A51',
					}}
					transition={{ duration: 0.12 }}
				/>
				{/* невидимый квадрат, чтобы было что масштабировать */}
				<span className='opacity-0 w-[7.58px] h-[7.58px]' />
			</motion.button>

			{/* ЦИФРА — по центру */}
			<span className='z-10 text-[10px] leading-none text-black'>{value}</span>

			{/* ПЛЮС — как раньше, симметрично минусу */}
			<motion.button
				type='button'
				onClick={onInc}
				onMouseEnter={() => setHoverSide('right')}
				onMouseDown={() => setActiveSide('right')}
				onMouseUp={() => setActiveSide(null)}
				onBlur={() => setActiveSide(null)}
				whileHover={{ scale: 1.15 }}
				whileTap={{ scale: 0.92 }}
				transition={{ duration: 0.12 }}
				className='relative z-10 inline-flex items-center justify-center p-[6px] -mx-[6px] -my-[6px] cursor-pointer'
				aria-label='Увеличить'
				title='Увеличить'
			>
				{/* горизонтальная */}
				<motion.span
					className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1px]'
					style={{ width: '7.58px', height: '1.08px' }}
					animate={{
						backgroundColor: hoverSide === 'right' ? '#BD52E9' : '#625A51',
					}}
					transition={{ duration: 0.12 }}
				/>
				{/* вертикальная */}
				<motion.span
					className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1px]'
					style={{ width: '1.08px', height: '7.58px' }}
					animate={{
						backgroundColor: hoverSide === 'right' ? '#BD52E9' : '#625A51',
					}}
					transition={{ duration: 0.12 }}
				/>
				{/* спейсер */}
				<span className='opacity-0 w-[7.58px] h-[7.58px]' />
			</motion.button>
		</div>
	)
}

export default memo(Qty)
