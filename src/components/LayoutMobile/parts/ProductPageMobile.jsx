// src/components/LayoutMobile/parts/ProductPageMobile.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import useProductsBoot from '../../../hooks/useProductsBoot'
import useSections from '../../../hooks/useSections'
import { setCategorySmart } from '../../../store/slices/categoriesSlice'
import { closeDetails, openDetails } from '../../../store/slices/detailsSlice'
import {
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../../store/slices/productsSlice'

import {
	clearApplied,
	selectFoundItems,
	selectShowFound,
	setShowFound,
} from '../../../store/slices/filtersSlice'
import { applySort, SORT_KEYS } from '../../../utils/sort'
import FoundSection from '../../FoundSection/FoundSection'
import SubcategoryPanel from '../../SubcategoryPanel/SubcategoryPanel'
import SectionMobile from './SectionMobile'

// используем уже имеющиеся стат-блоки
import StaticContactsBlock from '../../ProductsPage/static/StaticContactsBlock'
import StaticWholesaleBlock from '../../ProductsPage/static/StaticWholesaleBlock'

const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()
const PROMO_KEY = 'акции'

const FX = {
	initial: { opacity: 0 },
	enter: { opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } },
	exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
}

const ProductPageMobile = () => {
	useProductsBoot()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { pathname } = useLocation()

	const pageKey =
		pathname === '/contacts'
			? 'contacts'
			: pathname === '/wholesale'
			? 'wholesale'
			: null

	// ===== store =====
	const status = useSelector(s => s.products.status)
	const selectedCategory = useSelector(
		s => s.categories.selectedCategory || 'all'
	)
	const selectedSub = useSelector(s => s.categories.selectedSub || '')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
	const search = useSelector(s => s.products.searchQuery || '')
	const showFoundFlag = useSelector(selectShowFound)
	const foundItems = useSelector(selectFoundItems)

	// ===== local =====
	const isSearching = !!String(search).trim()
	const shouldShowFound = isSearching || showFoundFlag
	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)
	const [activeSub, setActiveSub] = useState(null)

	// ===== data prep =====
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

	const sections = useSections(
		homeDiscounted,
		homeNonDiscounted,
		selectedCategory
	)
	const sectionsSorted = useMemo(
		() =>
			sections.map(sec => ({ ...sec, items: applySort(sec.items, sortKey) })),
		[sections, sortKey]
	)

	// ====== открыть подкатегорию / список для секции ======
	const openSubcategory = useCallback(
		payload => {
			const n = s =>
				String(s || '')
					.trim()
					.toLowerCase()

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

			const t = n(title)
			const isPromo = t === PROMO_KEY

			// если список не передали — соберём по категории/субкатегории
			if (!products.length && title) {
				products = allItems.filter(
					p => n(p.category) === t || n(p.subcategory) === t
				)
			}

			// для обычной категории добавим ещё акционные той же категории
			if (!isPromo) {
				const isExactCategory = allItems.some(p => n(p.category) === t)
				let baseCategoryKey = t
				if (!isExactCategory) {
					const anyInSub = allItems.find(p => n(p.subcategory) === t)
					if (anyInSub) baseCategoryKey = n(anyInSub.category)
				}
				const dset = new Set(discountedAll.map(p => p.id))
				const discountedSameCat = allItems.filter(
					p => n(p.category) === baseCategoryKey && dset.has(p.id)
				)
				const byId = new Map()
				for (const p of products) byId.set(p.id, p)
				for (const p of discountedSameCat) byId.set(p.id, p)
				products = Array.from(byId.values())
			} else {
				// акции: гарантируем, что здесь только скидочные
				const dset = new Set(discountedAll.map(p => p.id))
				products = products.filter(p => dset.has(p.id))
			}

			// ВАЖНО:
			// для обычных категорий — синхронизируем Redux
			// для "акции" НИЧЕГО НЕ ТРОГАЕМ, чтобы не ломать фильтрацию
			if (title && !isPromo) {
				dispatch(setCategorySmart(title))
			}

			dispatch(setShowFound(false))
			dispatch(closeDetails())

			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems, discountedAll, dispatch]
	)

	const openDetailsRedux = useCallback(
		p => {
			if (p) dispatch(openDetails(p))
		},
		[dispatch]
	)

	// ====== Реакция на поиск ======
	useEffect(() => {
		if (isSearching) {
			if (pageKey) navigate('/', { replace: true })
			setActiveSub(null)
			dispatch(setShowFound(true))
			dispatch(setCategorySmart('all'))
			dispatch(closeDetails())
		} else {
			dispatch(setShowFound(false))
		}
		dispatch(clearApplied())
	}, [isSearching, pageKey, navigate, dispatch])

	// ====== Реакция на выбор подкатегории/категории (через Redux) ======
	useEffect(() => {
		const subKey = norm(selectedSub)
		const catKey = norm(selectedCategory)

		if (subKey) {
			if (pageKey) navigate('/', { replace: true })

			const products = allItems.filter(
				p => norm(p.subcategory) === subKey || norm(p.category) === subKey
			)
			setActiveSub({
				title: selectedSub,
				products,
			})
			dispatch(closeDetails())
			return
		}

		if (catKey === 'all') {
			setActiveSub(null)
			dispatch(closeDetails())
			return
		}

		// для конкретной категории (в т.ч. "акции" из фильтра) просто закрываем sub-панель:
		setActiveSub(null)
		dispatch(closeDetails())
	}, [selectedCategory, selectedSub, allItems, pageKey, navigate, dispatch])

	// ====== Если на статике начали показывать товары — уходим на '/' ======
	useEffect(() => {
		const showingProducts =
			shouldShowFound || activeSub || norm(selectedCategory) !== 'all'
		if (pageKey && showingProducts) {
			navigate('/', { replace: true })
		}
	}, [pageKey, shouldShowFound, activeSub, selectedCategory, navigate])

	// ====== Блоки ======
	const FoundHeader = (
		<div className='flex items-start pb-2.5  gap-2 px-1'>
			<div className='flex-1'>
				<h3 className='text-[18px] lowercase font-baron leading-none text-black'>
					найдено {Array.isArray(foundItems) ? foundItems.length : 0}
				</h3>
			</div>
		</div>
	)

	const foundBlock = (
		<motion.div
			key='found-mobile'
			layout='position'
			variants={FX}
			initial='initial'
			animate='enter'
			exit='exit'
		>
			{FoundHeader}
			<FoundSection
				products={applySort(foundItems || [], sortKey)}
				onSelectProduct={openDetailsRedux}
			/>
		</motion.div>
	)

	const subBlock = (
		<motion.div
			key='sub-mobile'
			layout='position'
			variants={FX}
			initial='initial'
			animate='enter'
			exit='exit'
		>
			<SubcategoryPanel
				title={activeSub?.title}
				products={applySort(activeSub?.products || [], sortKey)}
				onSelectProduct={openDetailsRedux}
				sortKey={sortKey}
				onOpenFilters={() => {}}
				mobile
			/>
		</motion.div>
	)

	const homeBlock = (
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
						onSelectProduct={openDetailsRedux}
						onOpenSubcategory={openSubcategory}
						loading={status === 'loading'}
						showHeader
					/>
				</motion.div>
			))}
		</motion.div>
	)

	const staticBlock =
		pageKey === 'contacts' ? (
			<motion.div
				key='static-contacts'
				layout='position'
				variants={FX}
				initial='initial'
				animate='enter'
				exit='exit'
			>
				<StaticContactsBlock />
			</motion.div>
		) : pageKey === 'wholesale' ? (
			<motion.div
				key='static-wholesale'
				layout='position'
				variants={FX}
				initial='initial'
				animate='enter'
				exit='exit'
			>
				<StaticWholesaleBlock />
			</motion.div>
		) : null

	return (
		<div className='px-3 py-3'>
			<AnimatePresence initial={false}>
				{shouldShowFound
					? foundBlock
					: activeSub
					? subBlock
					: pageKey
					? staticBlock
					: homeBlock}
			</AnimatePresence>
		</div>
	)
}

export default ProductPageMobile
