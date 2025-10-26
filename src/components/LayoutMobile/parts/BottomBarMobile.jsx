// src/components/LayoutMobile/parts/BottomBarMobile.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import SearchBar from '../../Search/SearchBar'
import MobileCartAccordionItems from './MobileCartAccordionItems'
import ProductCartMobile from './ProductCartMobile'

const BottomBarMobile = () => {
	const [open, setOpen] = useState(false)
	const toggle = () => setOpen(v => !v)
	const close = () => setOpen(false)

	// лок скролла body при открытой панели
	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [open])

	// вычисляем высоту «плитки» из фактической высоты окна
	const getTileHeight = useCallback(() => {
		const vh = typeof window !== 'undefined' ? window.innerHeight : 800

		// базовая доля экрана «как раньше»
		const base = Math.round(vh * 0.68)

		// нижний безопасный зазор под бар/жесты
		const safeGap = 20

		// жёсткие пределы, чтобы на очень маленьких экранах не ломалось
		const minH = 240 // минимум «плитки»
		const maxH = Math.max(360, vh - 70 - safeGap) // не выше окна минус шапка бара (70px) и зазор

		return Math.max(minH, Math.min(base, maxH))
	}, [])

	// текущее значение высоты
	const [targetHeight, setTargetHeight] = useState(() => getTileHeight())

	// пересчитываем на resize/orientationchange и при открытии панели
	useEffect(() => {
		const onResize = () => setTargetHeight(getTileHeight())
		window.addEventListener('resize', onResize)
		window.addEventListener('orientationchange', onResize)
		return () => {
			window.removeEventListener('resize', onResize)
			window.removeEventListener('orientationchange', onResize)
		}
	}, [getTileHeight])

	// на случай «толчка» после открытия (клавиатура/адресная строка)
	useEffect(() => {
		if (!open) return
		const id = setTimeout(() => setTargetHeight(getTileHeight()), 60)
		return () => clearTimeout(id)
	}, [open, getTileHeight])

	return (
		<>
			{/* затемняющий фон */}
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

			{/* нижняя панель */}
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
					{/* верхняя полоса */}
					<div className='h-[70px] flex items-center gap-2.5'>
						<div className='flex-1 min-w-0'>
							<SearchBar />
						</div>
						<div className='shrink-0'>
							<ProductCartMobile onOpen={toggle} />
						</div>
					</div>

					{/* контент корзины */}
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
