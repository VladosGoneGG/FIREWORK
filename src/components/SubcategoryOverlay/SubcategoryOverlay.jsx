// src/components/SubcategoryOverlay/SubcategoryOverlay.jsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
	selectFiltersForm,
	selectPreviewCount,
} from '../../store/slices/filtersSlice'

import useFilterOptions from './hooks/useFilterOptions'
import FilterContent from './parts/FilterContent'
import FilterFooter from './parts/FilterFooter'

/* ===== основной компонент ===== */
export default function SubcategoryOverlay({
	variant = 'standalone', // 'mobile' | 'standalone'
	isOpen,
	onApply,
	onReset,
	onClose,
	className = '',
	style = {},
	embed = false, // для аккордеона
}) {
	const form = useSelector(selectFiltersForm)
	const previewCount = useSelector(selectPreviewCount)
	const items = useSelector(s => s.products.items || [])

	const filterOptions = useFilterOptions(items)

	const [visible, setVisible] = useState(isOpen)
	useEffect(() => {
		if (isOpen) setVisible(true)
	}, [isOpen])

	// размеры по макету
	const W = 240
	const H = 834

	// === MOBILE VARIANT ===
	if (variant === 'mobile') {
		const InnerMobile = (
			<div
				className={[
					'w-auto h-[834px] flex flex-col',
					'bg-white',
					className,
				].join(' ')}
				style={style}
			>
				{/* верхняя тонкая полоска */}
				<div className='self-stretch flex flex-col gap-[5px]'>
					<div className='self-stretch h-0.5 bg-[#EFEBE6] rounded-[20px]' />
				</div>

				{/* ТЕЛО: теперь скроллируемое (как на десктопе) */}
				<div
					className={[
						'self-stretch px-5 pb-2.5 relative bg-white flex-1 min-h-0',
						'overflow-y-auto overscroll-contain touch-pan-y scroll-smooth',
						'[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
					].join(' ')}
					onWheelCapture={e => e.stopPropagation()}
					onTouchMoveCapture={e => e.stopPropagation()}
				>
					<FilterContent form={form} filterOptions={filterOptions} variant='mobile' />
				</div>

				<FilterFooter
					previewCount={previewCount}
					onApply={onApply}
					onReset={onReset}
					variant='mobile'
				/>
			</div>
		)

		if (embed) {
			return (
				visible && (
					<motion.div
						initial={{ height: 0, opacity: 0, y: -6 }}
						animate={{
							height: isOpen ? H : 0,
							opacity: isOpen ? 1 : 0,
							y: isOpen ? 0 : -6,
						}}
						exit={{ height: 0, opacity: 0, y: -6 }}
						transition={{
							height: { duration: 0.22, ease: 'easeOut' },
							opacity: { duration: 0.18 },
							y: { duration: 0.18 },
						}}
						className='relative w-auto overflow-hidden'
						onAnimationComplete={() => {
							if (!isOpen) setVisible(false)
						}}
					>
						{InnerMobile}
					</motion.div>
				)
			)
		}

		return visible ? InnerMobile : null
	}

	// === STANDALONE (десктоп) ===
	const InnerStandalone = (
		<div
			className={[
				'w-[240px]  h-[834px] rounded-[20px] flex flex-col',
				className,
			].join(' ')}
			style={style}
		>
			{/* header */}
			<div className='px-5 pt-[10px] relative top-[2px]'>
				<div className='text-[#625A51] text-lg font-baron lowercase'>
					фильтры
				</div>

				<button
					type='button'
					onClick={onClose}
					className='absolute top-4 right-5 w-6 h-6 grid place-items-center rounded text-[#625A51] hover:text-[#BD52E9] transition-colors focus:outline-none cursor-pointer'
					aria-label='Закрыть'
					title='Закрыть'
				>
					<svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
						<path
							d='M14.0625 5.9375L5.9375 14.0625M5.9375 5.9375L14.0625 14.0625'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</button>
			</div>
			<div className='w-[220px] h-[2px]  bg-[#EFEBE6] rounded-[20px] mt-2.5 mx-auto' />
			{/* body (как было — скролл) */}
			<div
				className='flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-[10px] pb-2 scroll-smooth scroll-hidden'
				onWheelCapture={e => e.stopPropagation()}
				onTouchMoveCapture={e => e.stopPropagation()}
			>
				<FilterContent form={form} filterOptions={filterOptions} variant='standalone' />
			</div>

			<FilterFooter
				previewCount={previewCount}
				onApply={onApply}
				onReset={onReset}
				variant='standalone'
			/>
		</div>
	)

	if (embed) {
		return (
			visible && (
				<motion.div
					initial={{ height: 0, opacity: 0, y: -6 }}
					animate={{ height: isOpen ? H : 0, opacity: isOpen ? 1 : 0 }}
					exit={{ height: 0, opacity: 0, y: -6 }}
					transition={{
						height: { duration: isOpen ? 0.18 : 0.25, ease: 'easeOut' },
						opacity: { duration: isOpen ? 0.18 : 0.2, ease: 'easeOut' },
						y: { duration: 0.18 },
					}}
					className='relative w-[240px]  bg-white rounded-[20px] overflow-hidden'
					onAnimationComplete={() => {
						if (!isOpen) setVisible(false)
					}}
				>
					{InnerStandalone}
				</motion.div>
			)
		)
	}

	return visible ? (
		<div
			className='absolute left-0 top-0 drop-shadow-[0_0_5px_rgba(0,0,0,0.2)] rounded-[20px]'
			style={{ width: W, height: H, pointerEvents: isOpen ? 'auto' : 'none' }}
		>
			<motion.div
				initial={false}
				animate={{ height: isOpen ? H : 0, opacity: isOpen ? 1 : 0 }}
				transition={{
					height: { duration: isOpen ? 0.18 : 0.25, ease: 'easeOut' },
					opacity: { duration: isOpen ? 0.18 : 0.2, ease: 'easeOut' },
				}}
				onAnimationComplete={() => {
					if (!isOpen) setVisible(false)
				}}
				className='relative w-[240px] bg-white rounded-[20px] overflow-hidden'
				style={{ willChange: 'height, opacity' }}
			>
				{InnerStandalone}
			</motion.div>
		</div>
	) : null
}
