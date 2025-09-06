// src/components/ProductsPage/ProductsPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import {
	fetchProducts,
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'

import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import PromoMain from '../PromoMain/PromoMain'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'

const sortFns = {
	cheap: arr =>
		[...arr].sort(
			(a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
		),
	exp: arr =>
		[...arr].sort(
			(a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)
		),
	new: arr => [...arr], // заглушка
	pop: arr => [...arr], // заглушка
}

const ProductsPage = ({ onToggleFilters, onDetailsModeChange }) => {
	const dispatch = useDispatch()
	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)

	// режим: details или subcategory или обычный список
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [activeSub, setActiveSub] = useState(null)
	const [sortKey, setSortKey] = useState('cheap')

	const openDetails = p => {
		setSelectedProduct(p)
		onDetailsModeChange?.(true)
	}
	const closeDetails = () => {
		setSelectedProduct(null)
		onDetailsModeChange?.(false)
	}

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchProducts())
			dispatch(fetchCategories())
		}
	}, [status, dispatch])

	// related для деталей
	const related = useMemo(() => {
		if (!selectedProduct) return []
		return allItems
			.filter(
				p =>
					p.category === selectedProduct.category && p.id !== selectedProduct.id
			)
			.slice(0, 10)
	}, [allItems, selectedProduct])

	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
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

	const sections = useMemo(() => {
		const res = []
		if (discounted.length > 0) res.push({ title: 'Акции', items: discounted })

		if ((selected || 'all').toLowerCase() !== 'all') {
			res.push({
				title: selected[0].toUpperCase() + selected.slice(1),
				items: nonDiscounted,
			})
		} else {
			const map = new Map()
			for (const p of nonDiscounted) {
				const key = p.category || 'Без категории'
				if (!map.has(key)) map.set(key, [])
				map.get(key).push(p)
			}
			for (const [title, items] of map) res.push({ title, items })
		}
		return res
	}, [discounted, nonDiscounted, selected])

	// ==================
	// РЕНДЕР
	// ==================

	if (status === 'loading')
		return (
			<div className='bg-white rounded-[20px] p-3'>Загрузка товаров...</div>
		)
	if (status === 'failed')
		return <div className='bg-white rounded-[20px] p-3'>Ошибка загрузки</div>

	if (selectedProduct) {
		return (
			<ProductDetails
				product={selectedProduct}
				related={related}
				onBack={closeDetails}
			/>
		)
	}

	if (activeSub) {
		const sorter = sortFns[sortKey] ?? (a => a)
		const sorted = sorter(activeSub.products)

		return (
			<SubcategoryPanel
				title={activeSub.title}
				products={sorted}
				onClose={() => setActiveSub(null)}
				onSelectProduct={openDetails}
				onOpenFilters={onToggleFilters}
				sort={sortKey}
				onChangeSort={setSortKey}
			/>
		)
	}

	// Обычный список: белая карточка + PromoMain + секции
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
						onOpenSubcategory={payload => setActiveSub(payload)}
					/>
				))}
			</div>
		</div>
	)
}

export default ProductsPage
