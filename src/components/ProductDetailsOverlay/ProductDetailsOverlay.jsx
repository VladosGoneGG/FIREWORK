// src/components/ProductDetailsOverlay/ProductDetailsOverlay.jsx
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProductDetails from '../../components/ProductDetails/ProductDetails'
import useBodyScrollLock from '../../hooks/useBodyScrollLock'
import useEscapeToClose from '../../hooks/useEscapeToClose'
import useMediaQuery from '../../hooks/useMediaQuery'
import {
	closeDetails,
	openDetails,
	selectSelectedProduct,
} from '../../store/slices/detailsSlice'
import { normalizeString } from '../../utils/normalize'

// Открытие зеркалит закрытие: обе едут влево с одинаковой скоростью и
// плавным easeInOut вместо резкого линейного fade.
const OVERLAY = {
	hidden: { opacity: 0, x: 24 },
	show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
	exit: { opacity: 0, x: -24, transition: { duration: 0.3, ease: 'easeInOut' } },
}

export default function ProductDetailsOverlay() {
	const dispatch = useDispatch()
	const isMobile = useMediaQuery('(max-width: 1040px)')

	const product = useSelector(selectSelectedProduct)
	const allItems = useSelector(s => s.products.items || [])
	const searchQuery = useSelector(s => s.products.searchQuery || '') // 👈 добавили

	const [stickyProduct, setStickyProduct] = useState(null)
	// Как и на десктопе: контент показываем только после того, как контейнер
	// (белый лист) доехал до места — и прячем СРАЗУ (flushSync) при закрытии,
	// ещё до того как контейнер начнёт уезжать, иначе он мелькает во время
	// закрытия.
	const [contentReady, setContentReady] = useState(false)
	const displayProductRef = useRef(null)

	useEffect(() => {
		if (product) setStickyProduct(product)
	}, [product])

	useEffect(() => {
		if (!isMobile && (product || stickyProduct)) handleClose()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile])

	// 👇 если на мобиле начинаем вводить поиск — закрываем детали
	useEffect(() => {
		if (isMobile && searchQuery.trim() !== '') {
			handleClose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile, searchQuery])

	const displayProduct = isMobile ? product || stickyProduct : null

	useEffect(() => {
		displayProductRef.current = displayProduct
	}, [displayProduct])

	useBodyScrollLock(!!displayProduct)

	const related = useMemo(() => {
		if (!displayProduct) return []
		const category = normalizeString(displayProduct.category)
		return allItems.filter(
			p => normalizeString(p.category) === category && p.id !== displayProduct.id
		)
	}, [allItems, displayProduct])

	const handleClose = () => {
		// Прячем контент СИНХРОННО, пока белый лист ещё виден и закрытие не
		// началось — иначе AnimatePresence захватит для exit кадр с ещё
		// видимым контентом, и он мелькает прямо во время закрытия.
		flushSync(() => setContentReady(false))
		setStickyProduct(null)
		dispatch(closeDetails())
	}

	useEscapeToClose(!!displayProduct, handleClose)

	const handleSelectProduct = p => {
		// Открываем "с нуля" только если до этого ничего не было открыто —
		// переход между связанными товарами внутри уже открытой карточки
		// контент заново не прячет.
		if (!displayProductRef.current) setContentReady(false)
		dispatch(openDetails(p)) // или openDetails({ id: p.id }) если у тебя так
	}

	return createPortal(
		<AnimatePresence>
			{displayProduct && (
				<motion.div
					key='details-overlay'
					variants={OVERLAY}
					initial='hidden'
					animate='show'
					exit='exit'
					className={[
						'fixed inset-0 z-50 bg-white overflow-y-auto',
						'[-ms-overflow-style:none]',
						'[scrollbar-width:none]',
						'[&::-webkit-scrollbar]:hidden',
					].join(' ')}
					onAnimationComplete={definition => {
						if (definition === 'show') setContentReady(true)
					}}
				>
					{contentReady && (
						<ProductDetails
							product={displayProduct}
							related={related}
							onBack={handleClose}
							onOpenSubcategory={handleClose}
							onSelectProduct={handleSelectProduct}
						/>
					)}
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
