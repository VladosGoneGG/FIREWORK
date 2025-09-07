// src/components/ProductsPage/ProductsPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import promoMain from '../../assets/SVG/bannerMain2.svg'
import useProductsBoot from '../../hooks/useProductsBoot'
import useRelated from '../../hooks/useRelated'
import useSections from '../../hooks/useSections'
import {
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'
import { applySort, SORT_KEYS } from '../../utils/sort'
import PromoDetails from '../PromoDetails/PromoDetails'
import PromoMain from '../PromoMain/PromoMain'

import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'

const ProductsPage = ({ onToggleFilters, onDetailsModeChange }) => {
	// загрузка данных при необходимости
	useProductsBoot()

	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)

	// экраны
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [activeSub, setActiveSub] = useState(null)
	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)
	const [promoOpen, setPromoOpen] = useState(false)
	// при смене выбранной категории — закрываем вложенные экраны
	useEffect(() => {
		setPromoOpen(false)
		setSelectedProduct(null)
		setActiveSub(null)
		onDetailsModeChange?.(false)
	}, [selected, onDetailsModeChange])

	// related для деталей
	const related = useRelated(allItems, selectedProduct, 10)

	// related для промо (просто отдай, например, список акционных или любые 7 из filtered)
	const promoRelated = useMemo(() => {
		// можно показывать скидочные, а если их нет — первые из отфильтрованных
		const list = discountedAll.length ? discountedAll : filtered
		return list.slice(0, 14) // с запасом, внизу режем до 7
	}, [discountedAll, filtered])

	// разбиение на акционные/обычные
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

	// секции списка
	const sections = useSections(discounted, nonDiscounted, selected)

	// ================== коллбэки ==================
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

	// Нормализация payload подкатегории:
	// - строка => ищем по category
	// - объект без products => подбираем из allItems по title/category
	// - объект с products => используем как есть
	const openSubcategory = useCallback(
		payload => {
			let title = ''
			let products = []

			if (typeof payload === 'string') {
				title = payload
			} else if (payload && typeof payload === 'object') {
				title = payload.title || payload.category || ''
				if (Array.isArray(payload.products)) {
					products = payload.products
				}
			}

			if (!products.length && title) {
				const t = String(title).toLowerCase()
				products = allItems.filter(p => (p.category || '').toLowerCase() === t)
			}

			setActiveSub({ title, products })
		},
		[allItems]
	)

	const closeSubcategory = useCallback(() => {
		setActiveSub(null)
	}, [])

	// ================== РЕНДЕР ==================

	if (promoOpen) {
		onDetailsModeChange?.(true) // расширим центр и скроем левую колонку
		return (
			<PromoDetails
				banner={promoMain}
				titleLines={[
					'закажи выступление артистов-пиротехников',
					'и получи салют в подарок',
				]}
				description={
					'Опиши условия акции: даты проведения, контактные данные, что входит в предложение и т.д.'
				}
				related={promoRelated}
				onBack={() => {
					setPromoOpen(false)
					onDetailsModeChange?.(false)
				}}
				onSelectProduct={p => {
					// клик по карточке внизу промо — открываем детали товара
					setPromoOpen(false)
					setSelectedProduct(p)
					onDetailsModeChange?.(true)
				}}
				onOpenSubcategory={payload => {
					// «посмотреть ещё» — закрываем промо и открываем подкатегорию
					setPromoOpen(false)
					setActiveSub(
						payload?.title ? { title: payload.title, products: filtered } : null
					)
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
					// закрыть детали → открыть подкатегорию
					closeDetails()
					// сюда может прилететь { title, products } ИЛИ просто title
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

	// 3) Обычный список: PromoMain + секции
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
