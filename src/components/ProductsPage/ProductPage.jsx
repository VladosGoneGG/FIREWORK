// src/components/ProductsPage/ProductsPage.jsx
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
import PromoDetails from '../PromoDetails/PromoDetails'
import PromoMain from '../PromoMain/PromoMain'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'

import { AnimatePresence, motion } from 'motion/react'

/**
 * Props:
 * - onToggleFilters?: (open:boolean) => void
 * - onDetailsModeChange?: (on:boolean) => void
 * - externalSelectedProduct?: Product | null
 * - onConsumeExternalSelected?: () => void
 * - overlayFilters?: object
 * - overlayFiltersPreview?: object
 * - onFiltersCountChange?: (n:number) => void
 * - filtersOpen?: boolean
 */
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

	// глобальный стейт
	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
	const search = useSelector(s => s.products.searchQuery || '')

	// локальные экраны
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [activeSub, setActiveSub] = useState(null) // { title, products }
	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)
	const [promoOpen, setPromoOpen] = useState(false)

	// управление режимом центра (ширина/скрытие левой колонки)
	useEffect(() => {
		onDetailsModeChange?.(Boolean(selectedProduct) || promoOpen)
	}, [selectedProduct, promoOpen, onDetailsModeChange])

	// Смена категории → закрываем вложенные экраны
	useEffect(() => {
		setPromoOpen(false)
		setSelectedProduct(null)
		setActiveSub(null)
	}, [selected])

	// Товар из модалки → открыть детали
	useEffect(() => {
		if (!externalSelectedProduct) return
		setPromoOpen(false)
		setActiveSub(null)
		setSelectedProduct(externalSelectedProduct)
		onConsumeExternalSelected?.()
	}, [externalSelectedProduct, onConsumeExternalSelected])

	// При активном поиске закрываем вложенные экраны
	useEffect(() => {
		if (!search.trim()) return
		setPromoOpen(false)
		setSelectedProduct(null)
		setActiveSub(null)
	}, [search])

	// related
	const related = useRelated(allItems, selectedProduct, 10)

	// related для промо
	const promoRelated = useMemo(() => {
		const list = discountedAll.length ? discountedAll : filtered
		return list.slice(0, 14)
	}, [discountedAll, filtered])

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

	// ----- данные подкатегории -----
	const activeList = useMemo(
		() => (Array.isArray(activeSub?.products) ? activeSub.products : []),
		[activeSub]
	)

	// применённые фильтры
	const filteredApplied = useMemo(
		() => applyAdvancedFilter(activeList, overlayFilters),
		[activeList, overlayFilters]
	)
	const sortedApplied = useMemo(
		() => applySort(filteredApplied, sortKey),
		[filteredApplied, sortKey]
	)

	// превью-фильтры — только для счётчика «найдено N»
	const filteredPreview = useMemo(
		() => applyAdvancedFilter(activeList, overlayFiltersPreview),
		[activeList, overlayFiltersPreview]
	)
	useEffect(() => {
		if (activeSub) onFiltersCountChange(filteredPreview.length)
	}, [activeSub, filteredPreview.length, onFiltersCountChange])

	// ----- коллбэки -----
	const openDetails = useCallback(p => {
		setPromoOpen(false)
		setSelectedProduct(p)
	}, [])

	const closeDetails = useCallback(() => {
		setSelectedProduct(null)
	}, [])

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

			setPromoOpen(false)
			setSelectedProduct(null)
			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems]
	)

	const closeSubcategory = useCallback(() => setActiveSub(null), [])

	// ----- анимационные пресеты -----
	const fastScreen = {
		initial: { y: 10, scale: 0.995, opacity: 1 },
		animate: {
			y: 0,
			scale: 1,
			opacity: 1,
			transition: { duration: 0.08, ease: 'easeOut' },
		},
		exit: {
			y: -10,
			scale: 0.995,
			opacity: 1,
			transition: { duration: 0.08, ease: 'easeIn' },
		},
	}

	return (
		<AnimatePresence mode='wait'>
			{promoOpen ? (
				<motion.div key='promo' {...fastScreen} layout>
					<PromoDetails
						currentCategory={promoRelated[0]?.category || ''}
						description='Опиши условия акции: сроки, контакты, что входит и т.п.'
						related={promoRelated}
						onBack={() => setPromoOpen(false)}
						onSelectProduct={p => {
							setPromoOpen(false)
							setSelectedProduct(p)
						}}
						onOpenSubcategory={payload => {
							setPromoOpen(false)
							openSubcategory(payload)
						}}
					/>
				</motion.div>
			) : selectedProduct ? (
				<motion.div
					key={`details-${selectedProduct.id}`}
					{...fastScreen}
					layout
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
			) : activeSub ? (
				<motion.div
					key={`sub-${activeSub.title}`}
					{...fastScreen}
					layout
					initial={{ opacity: 0, y: 24, scale: 0.985 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -24, scale: 0.985 }}
					transition={{ duration: 0.45, ease: 'easeOut' }}
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
			) : (
				<motion.div
					key='home'
					initial={{ y: 8, opacity: 1 }}
					animate={{
						y: 0,
						opacity: 1,
						transition: { duration: 0.16, ease: 'easeOut' },
					}}
					exit={{
						y: -8,
						opacity: 1,
						transition: { duration: 0.1, ease: 'easeIn' },
					}}
					transition={{ duration: 0.35, ease: 'easeOut' }}
					className='bg-white rounded-[20px] p-3'
				>
					<PromoMain onOpen={() => setPromoOpen(true)} />
					<div className='space-y-6'>
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
	)
}

export default ProductsPage
