// src/components/ProductDetailsOverlay/ProductDetailsOverlay.jsx
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProductDetails from '../../components/ProductDetails/ProductDetails'
import useMediaQuery from '../../hooks/useMediaQuery'
import {
	closeDetails,
	openDetails,
	selectSelectedProduct,
} from '../../store/slices/detailsSlice'
import { normalizeString } from '../../utils/normalize'

export default function ProductDetailsOverlay() {
	const dispatch = useDispatch()
	const isMobile = useMediaQuery('(max-width: 1040px)')

	const product = useSelector(selectSelectedProduct)
	const allItems = useSelector(s => s.products.items || [])
	const searchQuery = useSelector(s => s.products.searchQuery || '') // 👈 добавили

	const [stickyProduct, setStickyProduct] = useState(null)

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

	const related = useMemo(() => {
		if (!displayProduct) return []
		const category = normalizeString(displayProduct.category)
		return allItems.filter(
			p => normalizeString(p.category) === category && p.id !== displayProduct.id
		)
	}, [allItems, displayProduct])

	const handleClose = () => {
		setStickyProduct(null)
		dispatch(closeDetails())
	}

	const handleSelectProduct = p => {
		dispatch(openDetails(p)) // или openDetails({ id: p.id }) если у тебя так
	}

	return createPortal(
		<AnimatePresence>
			{displayProduct && (
				<motion.div
					key='details-overlay'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className={[
						'fixed inset-0 z-50 bg-white overflow-y-auto',
						'[-ms-overflow-style:none]',
						'[scrollbar-width:none]',
						'[&::-webkit-scrollbar]:hidden',
					].join(' ')}
				>
					<div>
						<ProductDetails
							product={displayProduct}
							related={related}
							onBack={handleClose}
							onOpenSubcategory={handleClose}
							onSelectProduct={handleSelectProduct}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
