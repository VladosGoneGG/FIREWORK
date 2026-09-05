// src/components/LayoutMobile/parts/ProductPageMobile.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import useCatalogFilterQuery from '../../../hooks/useCatalogFilterQuery'
import useInfiniteScroll from '../../../hooks/useInfiniteScroll'
import useProductsBoot from '../../../hooks/useProductsBoot'
import useSections from '../../../hooks/useSections'
import { setCategorySmart } from '../../../store/slices/categoriesSlice'
import { closeDetails, openDetails } from '../../../store/slices/detailsSlice'
import {
	fetchProductDetail,
	fetchProductsPage,
	selectDiscountedProducts,
	selectFilteredProducts,
	selectFilters,
} from '../../../store/slices/productsSlice'
import { applyAdvancedFilter as applyProductFilters } from '../../../utils/filters'

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
import ProductStatusState from '../../ProductsPage/ProductStatusState'

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
	const productsError = useSelector(s => s.products.error)
	const pagination = useSelector(s => s.products.pagination)
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

	const productsFilters = useSelector(selectFilters)

	// ===== local =====
	const isSearching = !!String(search).trim()
	const shouldShowFound = isSearching || showFoundFlag
	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)
	const [activeSub, setActiveSub] = useState(null)

	// Категория/поиск больше не докачивают весь каталог — берём только то,
	// что сервер уже отфильтровал (см. desktop-версию/useCatalogFilterQuery).
	// Неактивен, пока открыта подкатегория/акции (activeSub) — там свой
	// снимок товаров, серверная category/search фильтрация туда не лезет.
	const catalogQuery = useCatalogFilterQuery({
		category: selectedCategory,
		search,
		active: !activeSub,
	})

	// ===== data prep =====
	const discountedSet = useMemo(
		() => new Set(discountedAll.map(p => p.id)),
		[discountedAll]
	)
	// "Живые" фильтры (модалка в BurgerMobile) применяются поверх
	// отфильтрованных сервером товаров, когда выбрана категория/поиск —
	// иначе как раньше, поверх обычного накопленного каталога.
	const baseFiltered = catalogQuery.isFiltering
		? applyProductFilters(catalogQuery.items, productsFilters)
		: filtered
	const homeDiscounted = useMemo(
		() => baseFiltered.filter(p => discountedSet.has(p.id)),
		[baseFiltered, discountedSet]
	)
	const homeNonDiscounted = useMemo(
		() => baseFiltered.filter(p => !discountedSet.has(p.id)),
		[baseFiltered, discountedSet]
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
			if (p) {
				dispatch(openDetails(p))
				if (p.id) dispatch(fetchProductDetail(p.id))
			}
		},
		[dispatch]
	)

	// Догружает следующую страницу каталога (см. desktop-версию) — актуально,
	// когда категория открыта до того, как все её товары успели подъехать.
	const loadMoreProducts = useCallback(() => {
		if (status === 'loading' || !pagination?.hasNext) return
		dispatch(fetchProductsPage({ page: pagination.page + 1 }))
	}, [dispatch, status, pagination])

	const canLoadMore = !!pagination?.hasNext

	// Пока выбрана категория или идёт поиск — статус/пагинация берутся из
	// server-side отфильтрованного catalogQuery, а не из глобальной
	// домашней пагинации (см. desktop-версию).
	const isFiltering = catalogQuery.isFiltering
	const effectiveStatus = isFiltering ? catalogQuery.status : status
	const effectiveCanLoadMore = isFiltering ? catalogQuery.canLoadMore : canLoadMore
	const effectiveLoadMore = isFiltering ? catalogQuery.loadMore : loadMoreProducts

	const homeSentinelRef = useInfiniteScroll(effectiveLoadMore, {
		enabled:
			effectiveCanLoadMore && effectiveStatus !== 'loading' && !activeSub && !shouldShowFound,
		deps: [isFiltering ? catalogQuery.items.length : allItems.length],
	})

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
	// (но не если товары уже были показаны ДО перехода на статику — иначе
	// переход на /contacts с активной категорией тут же отбрасывает обратно)
	const prevPageKeyRef = useRef(pageKey)
	useEffect(() => {
		const showingProducts =
			shouldShowFound || activeSub || norm(selectedCategory) !== 'all'
		const justArrived = prevPageKeyRef.current !== pageKey
		prevPageKeyRef.current = pageKey
		if (pageKey && showingProducts && !justArrived) {
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
				onLoadMore={effectiveLoadMore}
				canLoadMore={effectiveCanLoadMore}
				loadingMore={effectiveStatus === 'loading'}
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
				onLoadMore={loadMoreProducts}
				canLoadMore={!!pagination?.hasNext}
				loadingMore={status === 'loading'}
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
			{isFiltering && effectiveStatus === 'loading' && !sectionsSorted.length && (
				<div className='py-8 text-center text-[10px] text-[#625a51] lowercase font-baron'>
					загрузка…
				</div>
			)}
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
						loading={effectiveStatus === 'loading'}
						showHeader
						uncapped={norm(selectedCategory) !== 'all'}
					/>
				</motion.div>
			))}
			{effectiveCanLoadMore && <div ref={homeSentinelRef} className='h-2' />}
		</motion.div>
	)

	const statusBlock = (
		<motion.div
			key='status-mobile'
			layout='position'
			variants={FX}
			initial='initial'
			animate='enter'
			exit='exit'
		>
			<ProductStatusState
				status={status}
				error={productsError}
				isEmpty={!allItems.length}
				onRetry={() => dispatch(fetchProductsPage({ page: 1 }))}
			/>
		</motion.div>
	)

	const hasStatusIssue =
		status === 'failed' || (status === 'succeeded' && !allItems.length)

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
				{!pageKey && hasStatusIssue
					? statusBlock
					: shouldShowFound
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
