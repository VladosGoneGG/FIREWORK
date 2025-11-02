import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

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

	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
	const search = useSelector(s => s.products.searchQuery || '')

	const showFoundFlag = useSelector(selectShowFound)
	const foundItems = useSelector(selectFoundItems)

	const isSearching = !!String(search).trim()
	const shouldShowFound = isSearching || showFoundFlag

	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)
	const [activeSub, setActiveSub] = useState(null)

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
			sections.map(sec => ({ ...sec, items: applySort(sec.items, sortKey) })),
		[sections, sortKey]
	)

	const openSubcategory = useCallback(
		payload => {
			const n = s =>
				String(s || '')
					.trim()
					.toLowerCase()
			let title = ''
			let products = []
			if (typeof payload === 'string') title = payload
			else if (payload && typeof payload === 'object') {
				title = payload.title || payload.category || ''
				if (Array.isArray(payload.products) && payload.products.length) {
					products = payload.products
				}
			}
			const t = n(title)
			const isPromo = t === PROMO_KEY

			if (!products.length && title) {
				products = allItems.filter(
					p => n(p.category) === t || n(p.subcategory) === t
				)
			}
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
				const dset = new Set(discountedAll.map(p => p.id))
				products = products.filter(p => dset.has(p.id))
			}

			if (title) dispatch(setCategorySmart(isPromo ? PROMO_KEY : title))
			dispatch(setShowFound(false))
			dispatch(closeDetails()) // закрываем детали при входе в подкатегорию

			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems, discountedAll, dispatch]
	)

	// поиск: как на десктопе, но без кнопки фильтра
	useEffect(() => {
		if (isSearching) {
			setActiveSub(null)
			dispatch(setShowFound(true))
			dispatch(setCategorySmart('all'))
			dispatch(closeDetails())
			try {
				window.dispatchEvent(
					new CustomEvent('nav:category-picked', {
						detail: { category: 'all' },
					})
				)
			} catch {}
		} else {
			dispatch(setShowFound(false))
		}
		dispatch(clearApplied())
	}, [isSearching, dispatch])

	// событие: открыть подкатегорию из бургера
	useEffect(() => {
		const onOpenSub = e => {
			const title = e?.detail?.title
			if (title) {
				dispatch(closeDetails())
				openSubcategory({ title })
			}
		}
		window.addEventListener('nav:open-subcategory', onOpenSub)
		return () => window.removeEventListener('nav:open-subcategory', onOpenSub)
	}, [openSubcategory, dispatch])

	// событие: выбрана категория — закрываем sub-панель и детали
	useEffect(() => {
		const onPicked = () => {
			setActiveSub(null)
			dispatch(closeDetails())
		}
		window.addEventListener('nav:category-picked', onPicked)
		return () => window.removeEventListener('nav:category-picked', onPicked)
	}, [dispatch])

	// если ушли в "все" — гарантированно закрываем детали и подпанель
	useEffect(() => {
		if (norm(selected) === 'all') {
			setActiveSub(null)
			dispatch(closeDetails())
		}
	}, [selected, dispatch])

	const openDetailsRedux = useCallback(
		p => {
			if (p) dispatch(openDetails(p))
		},
		[dispatch]
	)

	const FoundHeader = (
		<div className='flex items-start pt-2.5 gap-2 px-1'>
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
				onOpenFilters={() =>
					window.dispatchEvent(new CustomEvent('ui:open-mobile-filters'))
				}
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
						showHeader={norm(sec.title) !== PROMO_KEY}
					/>
				</motion.div>
			))}
		</motion.div>
	)

	return (
		<div className='px-3 py-3'>
			<AnimatePresence initial={false}>
				{shouldShowFound ? foundBlock : activeSub ? subBlock : homeBlock}
			</AnimatePresence>
		</div>
	)
}

export default ProductPageMobile
