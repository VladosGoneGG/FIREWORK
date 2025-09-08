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

/**
 * Props:
 * - onToggleFilters?: (open:boolean) => void
 * - onDetailsModeChange?: (on:boolean) => void
 * - externalSelectedProduct?: Product | null
 * - onConsumeExternalSelected?: () => void
 * - overlayFilters?: object                 // ПРИМЕНЁННЫЕ фильтры (только по кнопке "показать")
 * - overlayFiltersPreview?: object          // Превью-фильтры (меняются во время ввода) — используются только для счётчика
 * - onFiltersCountChange?: (n:number) => void
 */
const ProductsPage = ({
	onToggleFilters,
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
	overlayFilters = {},
	overlayFiltersPreview = {},
	onFiltersCountChange = () => {},
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

	// related для деталей товара
	const related = useRelated(allItems, selectedProduct, 10)

	// related для промо
	const promoRelated = useMemo(() => {
		const list = discountedAll.length ? discountedAll : filtered
		return list.slice(0, 14)
	}, [discountedAll, filtered])

	// секции (акции / остальное)
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

	// применённые фильтры (ТОЛЬКО после нажатия «показать»)
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

	// ----- ветки рендера -----
	if (promoOpen) {
		return (
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
		)
	}

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

	if (activeSub) {
		return (
			<SubcategoryPanel
				title={activeSub.title}
				products={sortedApplied}
				onClose={closeSubcategory}
				onSelectProduct={openDetails}
				onOpenFilters={() => onToggleFilters?.(true)}
				sort={sortKey}
				onChangeSort={setSortKey}
			/>
		)
	}

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
