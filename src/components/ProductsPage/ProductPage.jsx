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

import { applySort, SORT_KEYS } from '../../utils/sort'

import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import PromoMain from '../PromoMain/PromoMain'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'

const ProductsPage = ({
	onToggleFilters,
	onDetailsModeChange,
	externalSelectedProduct, // ← из App
	onConsumeExternalSelected, // ← из App
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

	// При смене категории — закрыть вложенные экраны
	useEffect(() => {
		setSelectedProduct(null)
		setActiveSub(null)
		onDetailsModeChange?.(false)
	}, [selected, onDetailsModeChange])

	// Если пришёл товар из модалки — открыть детали
	useEffect(() => {
		if (externalSelectedProduct) {
			setActiveSub(null)
			setSelectedProduct(externalSelectedProduct)
			onDetailsModeChange?.(true)
			onConsumeExternalSelected?.()
		}
	}, [externalSelectedProduct, onConsumeExternalSelected, onDetailsModeChange])

	// Если введён поиск — показываем список (закрываем детали/подкатегорию)
	useEffect(() => {
		if (search.trim()) {
			setSelectedProduct(null)
			setActiveSub(null)
			onDetailsModeChange?.(false)
		}
	}, [search, onDetailsModeChange])

	const related = useRelated(allItems, selectedProduct, 10)

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

	const openDetails = useCallback(
		p => {
			setSelectedProduct(p)
			onDetailsModeChange?.(true)
		},
		[onDetailsModeChange]
	)
	const closeDetails = useCallback(() => {
		setSelectedProduct(null)
		onDetailsModeChange?.(false)
	}, [onDetailsModeChange])

	const openSubcategory = useCallback(
		payload => {
			// payload: { title, products } | string
			let title = ''
			let products = []
			if (typeof payload === 'string') title = payload
			else if (payload && typeof payload === 'object') {
				title = payload.title || payload.category || ''
				if (Array.isArray(payload.products)) products = payload.products
			}
			if (!products.length && title) {
				const t = String(title).toLowerCase()
				products = allItems.filter(p => (p.category || '').toLowerCase() === t)
			}
			setActiveSub({ title, products })
		},
		[allItems]
	)

	const closeSubcategory = useCallback(() => setActiveSub(null), [])

	// 1) Детали
	if (selectedProduct) {
		return (
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
		)
	}

	// 2) Подкатегория
	if (activeSub) {
		const list = Array.isArray(activeSub.products) ? activeSub.products : []
		const sorted = applySort(list, sortKey)
		return (
			<SubcategoryPanel
				title={activeSub.title}
				products={sorted}
				onClose={closeSubcategory}
				onSelectProduct={openDetails}
				onOpenFilters={onToggleFilters}
				sort={sortKey}
				onChangeSort={setSortKey}
			/>
		)
	}

	// 3) Список + баннер
	return (
		<div className='bg-white rounded-[20px] p-3'>
			<PromoMain />
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
		</div>
	)
}

export default ProductsPage
