// src/components/LayoutMobile/parts/ProductPageMobile.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import useProductsBoot from '../../../hooks/useProductsBoot'
import useSections from '../../../hooks/useSections'
import { setCategory } from '../../../store/slices/categoriesSlice'
import { openDetails } from '../../../store/slices/detailsSlice'
import {
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../../store/slices/productsSlice'

import { applySort, SORT_KEYS } from '../../../utils/sort'
import SectionMobile from './SectionMobile'

const ProductPageMobile = () => {
	useProductsBoot()

	const dispatch = useDispatch()

	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
	const search = useSelector(s => s.products.searchQuery || '')

	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)

	const norm = s =>
		String(s || '')
			.trim()
			.toLowerCase()
	const PROMO_KEY = 'акции'

	const discountedSet = useMemo(
		() => new Set(discountedAll.map(p => p.id)),
		[discountedAll]
	)
	const homeDiscounted = useMemo(
		() => filtered.filter(p => discountedSet.has(p.id)),
		[filtered, discountedSet]
	)
	const homeNonDiscounted = useMemo(
		() => filtered.filter(p => !discountedSet.has(p.id)),
		[filtered, discountedSet]
	)

	const sections = useSections(homeDiscounted, homeNonDiscounted, selected)
	const sectionsSorted = useMemo(
		() =>
			sections.map(sec => ({
				...sec,
				items: applySort(sec.items, sortKey),
			})),
		[sections, sortKey]
	)

	const openSubcategory = useCallback(
		payload => {
			let title = ''
			let products = []

			if (typeof payload === 'string') {
				title = payload
			} else if (payload && typeof payload === 'object') {
				title = payload.title || payload.category || ''
				if (Array.isArray(payload.products) && payload.products.length) {
					products = payload.products
				}
			}

			const t = norm(title)
			const isPromo = t === PROMO_KEY

			if (!products.length && title) {
				products = allItems.filter(
					p => norm(p.category) === t || norm(p.subcategory) === t
				)
			}

			if (isPromo) {
				products = products.filter(p => discountedSet.has(p.id))
			} else {
				products = products.filter(p => !discountedSet.has(p.id))
			}

			if (title) {
				dispatch(setCategory(isPromo ? PROMO_KEY : t))
			}
		},
		[allItems, discountedSet, dispatch]
	)

	const FX = {
		initial: { opacity: 0 },
		enter: { opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } },
		exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
	}

	useEffect(() => {}, [search])

	// Открыть детали через Redux (сохраняем снапшот в слайсе)
	const openDetailsRedux = useCallback(
		p => {
			if (p) dispatch(openDetails(p))
		},
		[dispatch]
	)

	return (
		<div className='px-3 py-3'>
			{/* один AnimatePresence без mode="wait" */}
			<AnimatePresence initial={false}>
				<motion.div
					key='home-mobile'
					layout='position'
					variants={FX}
					initial='initial'
					animate='enter'
					exit='exit'
					className='space-y-6'
				>
					{sectionsSorted.map(sec => (
						<motion.div
							key={sec.title}
							layout='position'
							variants={FX}
							initial='initial'
							animate='enter'
							exit='exit'
						>
							<SectionMobile
								title={sec.title}
								products={sec.items}
								onSelectProduct={openDetailsRedux} // ← клик по карточке
								onOpenSubcategory={openSubcategory}
								loading={status === 'loading'}
								showHeader={norm(sec.title) !== PROMO_KEY}
							/>
						</motion.div>
					))}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

export default ProductPageMobile
