// src/components/ProductsPage/ProductPage.jsx
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import useProductsBoot from '../../hooks/useProductsBoot'
import useRelated from '../../hooks/useRelated'
import useSections from '../../hooks/useSections'
import {
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'
import { applyAdvancedFilter } from '../../utils/filters'
import { applySort, SORT_KEYS } from '../../utils/sort'

import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import PromoSlider from '../PromoSlider/PromoSlider'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'

const NARROW_W = 665
const WIDE_W = 925

const ProductsPage = ({
	onToggleFilters,
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
	overlayFilters = {},
	overlayFiltersPreview = {},
	onFiltersCountChange = () => {},
	filtersOpen,
}) => {
	useProductsBoot()

	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
	const search = useSelector(s => s.products.searchQuery || '')

	const [selectedProduct, setSelectedProduct] = useState(null)
	const [activeSub, setActiveSub] = useState(null)
	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)

	// сообщаем родителю, что мы в режиме деталей (он может перестраивать макет)
	useEffect(() => {
		onDetailsModeChange?.(Boolean(selectedProduct))
	}, [selectedProduct, onDetailsModeChange])

	// смена категории — сбрасываем вложенные экраны
	useEffect(() => {
		setSelectedProduct(null)
		setActiveSub(null)
	}, [selected])

	// пришёл товар из глобального поиска
	useEffect(() => {
		if (!externalSelectedProduct) return
		setActiveSub(null)
		setSelectedProduct(externalSelectedProduct)
		onConsumeExternalSelected?.()
	}, [externalSelectedProduct, onConsumeExternalSelected])

	// при активном поиске закрываем вложенные экраны
	useEffect(() => {
		if (!search.trim()) return
		setSelectedProduct(null)
		setActiveSub(null)
	}, [search])

	const related = useRelated(allItems, selectedProduct, 10)

	// секции
	const discountedSet = useMemo(
		() => new Set(discountedAll.map(p => p.id)),
		[discountedAll]
	)
	const discounted = useMemo(
		() => filtered.filter(p => discountedSet.has(p.id)),
		[filtered, discountedSet]
	)
	const nonDiscounted = useMemo(
		() => filtered.filter(p => !discountedSet.has(p.id)),
		[filtered, discountedSet]
	)
	const sections = useSections(discounted, nonDiscounted, selected)

	// данные подкатегории
	const activeList = useMemo(
		() => (Array.isArray(activeSub?.products) ? activeSub.products : []),
		[activeSub]
	)

	// применённые и превью-фильтры
	const filteredApplied = useMemo(
		() => applyAdvancedFilter(activeList, overlayFilters),
		[activeList, overlayFilters]
	)
	const sortedApplied = useMemo(
		() => applySort(filteredApplied, sortKey),
		[filteredApplied, sortKey]
	)
	const filteredPreview = useMemo(
		() => applyAdvancedFilter(activeList, overlayFiltersPreview),
		[activeList, overlayFiltersPreview]
	)
	useEffect(() => {
		if (activeSub) onFiltersCountChange(filteredPreview.length)
	}, [activeSub, filteredPreview.length, onFiltersCountChange])

	// коллбэки
	const openDetails = useCallback(p => setSelectedProduct(p), [])
	const closeDetails = useCallback(() => setSelectedProduct(null), [])

	const norm = s =>
		String(s || '')
			.trim()
			.toLowerCase()
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

			if (!products.length && title) {
				const t = norm(title)
				products = allItems.filter(
					p => norm(p.category) === t || norm(p.subcategory) === t
				)
			}

			setSelectedProduct(null)
			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems]
	)
	const closeSubcategory = useCallback(() => setActiveSub(null), [])

	// лёгкие и быстрые анимации смены экранов
	const variants = {
		initial: { opacity: 0, y: 10 },
		enter: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.12, ease: 'easeOut' },
		},
		exit: { opacity: 0, y: -8, transition: { duration: 0.1, ease: 'easeIn' } },
	}

	// текущее состояние
	const view = selectedProduct ? 'details' : activeSub ? 'sub' : 'home'
	const targetWidth = view === 'details' ? WIDE_W : NARROW_W

	return (
		// ВНЕШНЯЯ РАМКА, которая плавно меняет ширину
		<motion.div
			className='mx-auto'
			initial={false}
			animate={{ width: targetWidth }}
			transition={{ duration: 0.18, ease: 'easeInOut' }}
			style={{ width: targetWidth }}
		>
			<AnimatePresence mode='sync' initial={false}>
				{view === 'details' && (
					<motion.div
						key='details'
						variants={variants}
						initial='initial'
						animate='enter'
						exit='exit'
						className='bg-white rounded-b-[20px]'
					>
						<ProductDetails
							product={selectedProduct}
							related={related}
							onBack={closeDetails}
							onOpenSubcategory={payload => {
								closeDetails()
								openSubcategory(payload?.title || selectedProduct.category)
							}}
							onSelectProduct={openDetails}
						/>
					</motion.div>
				)}

				{view === 'sub' && (
					<motion.div
						key='sub'
						variants={variants}
						initial='initial'
						animate='enter'
						exit='exit'
						className='bg-white rounded-b-[20px] p-3'
					>
						<SubcategoryPanel
							title={activeSub.title}
							products={sortedApplied}
							onClose={closeSubcategory}
							onSelectProduct={openDetails}
							onOpenFilters={() => onToggleFilters?.(!filtersOpen)}
							sort={sortKey}
							onChangeSort={setSortKey}
							filtersOpen={filtersOpen}
						/>
					</motion.div>
				)}

				{view === 'home' && (
					<motion.div
						key='home'
						variants={variants}
						initial='initial'
						animate='enter'
						exit='exit'
						className='bg-white rounded-b-[20px] p-3'
					>
						<PromoSlider active />
						<div className='mt-4 space-y-6'>
							{sections.map(sec => (
								<ProductSection
									key={sec.title}
									title={sec.title}
									products={sec.items}
									onSelectProduct={openDetails}
									onOpenSubcategory={payload =>
										openSubcategory(
											payload ?? { title: sec.title, products: sec.items }
										)
									}
									loading={status === 'loading'}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

export default ProductsPage
