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

const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

export default function ProductDetailsOverlay() {
	const dispatch = useDispatch()
	const isMobile = useMediaQuery('(max-width: 1040px)')

	const product = useSelector(selectSelectedProduct)
	const allItems = useSelector(s => s.products.items || [])

	const [stickyProduct, setStickyProduct] = useState(null)

	useEffect(() => {
		if (product) setStickyProduct(product)
	}, [product])

	useEffect(() => {
		if (!isMobile && (product || stickyProduct)) handleClose()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile])

	const displayProduct = isMobile ? product || stickyProduct : null

	const related = useMemo(() => {
		if (!displayProduct) return []
		const cat = norm(displayProduct.category)
		return allItems.filter(
			p => norm(p.category) === cat && p.id !== displayProduct.id
		)
	}, [allItems, displayProduct])

	const handleClose = () => {
		setStickyProduct(null)
		dispatch(closeDetails())
	}

	// 👇 Хендлер выбора товара из "добавь в набор"
	const handleSelectProduct = p => {
		// Если у тебя openDetails ждёт именно id, сделай так:
		// dispatch(openDetails({ id: p.id }))
		// Если ждёт весь объект продукта (часто так и делают), то так:
		dispatch(openDetails(p))
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
