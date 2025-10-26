// src/components/LayoutMobile/parts/BottomBarMobile.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import SearchBar from '../../Search/SearchBar'
import MobileCartAccordionItems from './MobileCartAccordionItems'
import ProductCartMobile from './ProductCartMobile'

const BottomBarMobile = () => {
	const [open, setOpen] = useState(false)
	const toggle = () => setOpen(v => !v)
	const close = () => setOpen(false)

	// блокировка скролла body при открытии
	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [open])

	// 🔒 безопасный таргет высоты (по умолчанию 520), пересчёт после монтирования и на ресайзах
	const [targetHeight, setTargetHeight] = useState(520)
	useEffect(() => {
		const calc = () => {
			const vh = typeof window !== 'undefined' ? window.innerHeight : 800
			// твоя прежняя логика, но безопасно и с клипом
			const h = Math.round(vh * 0.68)
			setTargetHeight(Math.max(260, Math.min(800, h)))
		}
		calc()
		window.addEventListener('resize', calc, { passive: true })
		return () => window.removeEventListener('resize', calc)
	}, [])

	return (
		<>
			<AnimatePresence>
				{open && (
					<motion.div
						key='cart-backdrop'
						className='fixed inset-0 bg-black/30'
						style={{ zIndex: 95 }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={close}
					/>
				)}
			</AnimatePresence>

			<div
				className='fixed inset-x-2.5 z-[100]'
				style={{ bottom: 'max(10px, env(safe-area-inset-bottom))' }}
				onClick={e => e.stopPropagation()}
			>
				<motion.div
					className={[
						'w-full max-w-[680px] mx-auto',
						'rounded-[30px] bg-[#efebe6]',
						'px-2.5',
					].join(' ')}
					animate={{ height: open ? 70 + targetHeight : 70 }}
					initial={false}
					transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
					style={{ overflow: 'hidden' }}
				>
					<div className='h-[70px] flex items-center gap-2.5'>
						<div className='flex-1 min-w-0'>
							<SearchBar />
						</div>
						<div className='shrink-0'>
							<ProductCartMobile onOpen={toggle} />
						</div>
					</div>

					<AnimatePresence initial={false}>
						{open && (
							<motion.div
								key='cart-content'
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.18 }}
								className='pb-2.5'
							>
								<MobileCartAccordionItems
									height={targetHeight}
									onClose={close}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</>
	)
}

export default BottomBarMobile
