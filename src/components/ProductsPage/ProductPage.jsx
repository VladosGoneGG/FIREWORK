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
import PromoDetails from '../PromoDetails/PromoDetails'
import PromoMain from '../PromoMain/PromoMain'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'

const ProductsPage = ({
	onToggleFilters,
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
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
	const [promoOpen, setPromoOpen] = useState(false)

	// Закрыть вложенные экраны при смене категории
	useEffect(() => {
		setPromoOpen(false)
		setSelectedProduct(null)
		setActiveSub(null)
		onDetailsModeChange?.(false)
	}, [selected, onDetailsModeChange])

	// товар из модалки → открыть детали
	useEffect(() => {
		if (externalSelectedProduct) {
			setPromoOpen(false)
			setActiveSub(null)
			setSelectedProduct(externalSelectedProduct)
			onDetailsModeChange?.(true)
			onConsumeExternalSelected?.()
		}
	}, [externalSelectedProduct, onConsumeExternalSelected, onDetailsModeChange])

	// при поиске показываем список
	useEffect(() => {
		if (search.trim()) {
			setPromoOpen(false)
			setSelectedProduct(null)
			setActiveSub(null)
			onDetailsModeChange?.(false)
		}
	}, [search, onDetailsModeChange])

	// related для деталей
	const related = useRelated(allItems, selectedProduct, 10)

	// related для промо (например, скидочные или просто первые из filtered)
	const promoRelated = useMemo(() => {
		const list = discountedAll.length ? discountedAll : filtered
		return list.slice(0, 14)
	}, [discountedAll, filtered])

	// разбиение на секции
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
			setPromoOpen(false)
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
			setPromoOpen(false)
			setActiveSub({ title, products })
		},
		[allItems]
	)

	const closeSubcategory = useCallback(() => setActiveSub(null), [])

	// 0) PROMO DETAILS (ветка должна быть раньше деталей/подкатегории)
	if (promoOpen) {
		onDetailsModeChange?.(true)
		return (
			<PromoDetails
				currentCategory={promoRelated[0]?.category || ''} // ← ВАЖНО
				description={'Опиши условия акции: сроки, контакты, что входит и т.п.'}
				related={promoRelated}
				onBack={() => {
					setPromoOpen(false)
					onDetailsModeChange?.(false)
				}}
				onSelectProduct={p => {
					setPromoOpen(false)
					setSelectedProduct(p)
					onDetailsModeChange?.(true)
				}}
				onOpenSubcategory={payload => {
					// payload тут — СТРОКА категории (см. PromoDetails)
					// openSubcategory уже умеет по названию категории собрать товары из allItems
					setPromoOpen(false)
					openSubcategory(payload) // передаём строку
					onDetailsModeChange?.(false)
				}}
			/>
		)
	}

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
		</div>
	)
}

export default ProductsPage
