// src/components/ProductsPage/ProductPage.jsx
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import useProductsBoot from '../../hooks/useProductsBoot'
import useRelated from '../../hooks/useRelated'
import useSections from '../../hooks/useSections'
import { setCategorySmart } from '../../store/slices/categoriesSlice'
import {
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'

import { applyAdvancedFilter as applyFilters } from '../../utils/filters'
import { applySort, SORT_KEYS } from '../../utils/sort'

import FoundSection from '../FoundSection/FoundSection'
import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import PromoSlider from '../PromoSlider/PromoSlider'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'
import SortDropdown from '../ui/SortDropdown'

import {
	clearApplied,
	selectFoundItems,
	selectPreviewCount,
	selectShowFound,
	setShowFound,
} from '../../store/slices/filtersSlice'

const PROMO_KEY = 'акции'
const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

const ProductsPage = ({
	onToggleFilters,
	filtersOpen,
	onFiltersCountChange = () => {},
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
	showSlider = true,
}) => {
	useProductsBoot()

	const dispatch = useDispatch()

	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const allItems = useSelector(s => s.products.items)
	const filtered = useSelector(selectFilteredProducts)
	const discountedAll = useSelector(selectDiscountedProducts)
	const search = useSelector(s => s.products.searchQuery || '')

	const showFound = useSelector(selectShowFound)
	const foundItems = useSelector(selectFoundItems)
	const previewCount = useSelector(selectPreviewCount)

	const [selectedProduct, setSelectedProduct] = useState(null)
	const [activeSub, setActiveSub] = useState(null)
	const [sortKey, setSortKey] = useState(SORT_KEYS.CHEAP)

	const anchorRef = useRef(null)
	const skipNextCategoryEffect = useRef(false)

	useEffect(() => {
		onDetailsModeChange?.(Boolean(selectedProduct))
	}, [selectedProduct, onDetailsModeChange])

	useEffect(() => {
		if (skipNextCategoryEffect.current) {
			skipNextCategoryEffect.current = false
			return
		}
		setSelectedProduct(null)
		setActiveSub(null)
		dispatch(clearApplied())
	}, [selected, dispatch])

	useEffect(() => {
		if (!externalSelectedProduct) return
		setActiveSub(null)
		setSelectedProduct(externalSelectedProduct)
		dispatch(setShowFound(false))
		onConsumeExternalSelected?.()
	}, [externalSelectedProduct, onConsumeExternalSelected, dispatch])

	// === ВАЖНО: обновлённый эффект по поиску (порядок действий) ===
	useEffect(() => {
		const q = String(search).trim()

		if (q) {
			// 1) сначала очищаем прикладные фильтры и выставляем категорию all
			dispatch(clearApplied())
			dispatch(setCategorySmart('all'))
			try {
				window.dispatchEvent(
					new CustomEvent('nav:category-picked', {
						detail: { category: 'all' },
					})
				)
			} catch {}

			// 2) затем включаем Found — ПОСЛЕДНИМ действием
			dispatch(setShowFound(true))

			// 3) гасим детали/подкатегорию
			setSelectedProduct(null)
			setActiveSub(null)
		} else {
			// пустой запрос — выключаем Found
			dispatch(setShowFound(false))
		}
	}, [search, dispatch])

	useEffect(() => {
		onFiltersCountChange(previewCount)
	}, [previewCount, onFiltersCountChange])

	const related = useRelated(allItems, selectedProduct, 10)

	const view = activeSub ? 'sub' : 'home'
	const shouldShowSlider =
		!!showSlider &&
		!selectedProduct &&
		!activeSub &&
		!String(search).trim() &&
		!showFound

	// ===== вычисления сверху (хуки стабильно) =====
	const homeFiltered = useMemo(() => applyFilters(filtered, {}), [filtered])

	const discountedSet = useMemo(
		() => new Set(discountedAll.map(p => p.id)),
		[discountedAll]
	)

	const homeDiscounted = useMemo(
		() => homeFiltered.filter(p => discountedSet.has(p.id)),
		[homeFiltered, discountedSet]
	)
	const homeNonDiscounted = useMemo(
		() => homeFiltered.filter(p => !discountedSet.has(p.id)),
		[homeFiltered, discountedSet]
	)

	const homeSections = useSections(homeDiscounted, homeNonDiscounted, selected)

	const sections = useMemo(() => {
		if (selected === 'all') return homeSections

		if (norm(selected) === PROMO_KEY) {
			const promoItems = allItems.filter(p => discountedSet.has(p.id))
			return [{ title: PROMO_KEY, items: promoItems }]
		}

		const sel = norm(selected)
		const inCategory = allItems.filter(p => norm(p.category) === sel)

		const catPromoItems = inCategory.filter(p => discountedSet.has(p.id))

		const bySub = new Map()
		for (const p of inCategory) {
			const sub = norm(p.subcategory) || 'прочее'
			if (!bySub.has(sub)) bySub.set(sub, [])
			bySub.get(sub).push(p)
		}

		const result = []
		if (catPromoItems.length)
			result.push({ title: PROMO_KEY, items: catPromoItems })
		for (const [subKey, items] of bySub.entries()) {
			const prettyTitle = items.find(p => p?.subcategory)?.subcategory || subKey
			result.push({ title: prettyTitle, items })
		}
		return result
	}, [selected, allItems, discountedSet, homeSections])

	const sectionsSorted = useMemo(
		() =>
			sections.map(sec => ({ ...sec, items: applySort(sec.items, sortKey) })),
		[sections, sortKey]
	)

	const promoSec = useMemo(
		() => sectionsSorted.find(s => norm(s.title) === PROMO_KEY),
		[sectionsSorted]
	)
	const promoHasMore = !!promoSec && promoSec.items.length > 5

	// ===== Навигация по подкатегориям =====
	const openSubcategory = useCallback(
		payload => {
			const title =
				typeof payload === 'string'
					? payload
					: payload?.title || payload?.category || ''

			let products =
				Array.isArray(payload?.products) && payload.products.length
					? payload.products
					: null

			const n = s =>
				String(s || '')
					.trim()
					.toLowerCase()

			if (!products) {
				const t = n(title)
				products = allItems.filter(
					p => n(p.category) === t || n(p.subcategory) === t
				)
			}

			if (title) {
				skipNextCategoryEffect.current = true
				dispatch(setCategorySmart(title)) // ⬅️ умный сет
			}

			setSelectedProduct(null)
			dispatch(setShowFound(false))
			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems, dispatch]
	)

	// слушаем: открыть конкретную подкатегорию из сайдбара
	useEffect(() => {
		const onOpenSub = e => {
			const title = e?.detail?.title
			if (title) {
				openSubcategory({ title })
			}
		}
		window.addEventListener('nav:open-subcategory', onOpenSub)
		return () => window.removeEventListener('nav:open-subcategory', onOpenSub)
	}, [openSubcategory])

	// слушаем: выбрана категория (включая «все») — гасим открытую подкатегорию
	useEffect(() => {
		const onPicked = () => setActiveSub(null)
		window.addEventListener('nav:category-picked', onPicked)
		return () => window.removeEventListener('nav:category-picked', onPicked)
	}, [])

	const openPromo = useCallback(() => {
		if (!promoSec) return
		openSubcategory({ title: promoSec.title, products: promoSec.items })
	}, [promoSec, openSubcategory])

	const activeList = useMemo(
		() => (Array.isArray(activeSub?.products) ? activeSub.products : []),
		[activeSub]
	)

	const subSorted = useMemo(
		() => applySort(activeList, sortKey),
		[activeList, sortKey]
	)

	const openDetails = useCallback(p => setSelectedProduct(p), [])
	const closeDetails = useCallback(() => setSelectedProduct(null), [])

	const FX = {
		initial: { opacity: 0 },
		enter: { opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } },
		exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
	}

	const FilterBar = (
		<div className='relative'>
			<div className='flex items-start pt-2.5 gap-2 '>
				<div className='pl-1 flex-1'>
					{showFound ? (
						<div className='flex flex-col gap-1'>
							<h3 className='text-[18px] lowercase font-baron leading-none text-black'>
								найдено {Array.isArray(foundItems) ? foundItems.length : 0}
							</h3>
						</div>
					) : promoSec ? (
						<div className='flex flex-col gap-1'>
							<h3 className='text-[18px] lowercase font-baron leading-none text-black'>
								{promoSec.title}
							</h3>
							{promoHasMore && (
								<button
									type='button'
									onClick={openPromo}
									className='absolute left-20 bottom-1.5 text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'
								>
									посмотреть ещё
								</button>
							)}
						</div>
					) : null}
				</div>

				<div className='ml-auto flex items-center gap-2'>
					<button
						type='button'
						onClick={() => {
							dispatch(setShowFound(false))
							onToggleFilters?.()
						}}
						className={[
							'w-[75px] h-[25px] px-[5px] py-1 rounded-[10px] font-baron text-[10px]',
							filtersOpen
								? 'bg-[#EFEBE7] text-[#BD52E9]'
								: 'btn-firework-filter',
						].join(' ')}
					>
						<span>фильтр</span>
					</button>
					<SortDropdown value={sortKey} onChange={setSortKey} />
				</div>
			</div>
		</div>
	)

	return (
		<LayoutGroup id='products-page'>
			<div
				ref={anchorRef}
				className={`relative bg-white rounded-[20px] overflow-hidden mx-auto 
           w-full max-w-[1200px] px-4 lg:px-3 md:px-2
          ${selectedProduct ? 'h-[834px]' : 'min-h-[834px]'}`}
			>
				<motion.div layout='position'>
					<motion.div
						layout='position'
						initial={false}
						animate={selectedProduct ? { opacity: 0 } : { opacity: 1 }}
						style={{
							position: selectedProduct ? 'absolute' : 'static',
							inset: selectedProduct ? 0 : 'auto',
							visibility: selectedProduct ? 'hidden' : 'visible',
							pointerEvents: selectedProduct ? 'none' : 'auto',
							width: '100%',
						}}
					>
						{view === 'home' && (
							<motion.div
								variants={FX}
								initial='initial'
								animate='enter'
								exit='exit'
								layout='position'
							>
								{!selectedProduct &&
								!activeSub &&
								!String(search).trim() &&
								!showFound &&
								showSlider ? (
									<PromoSlider active />
								) : (
									FilterBar
								)}
							</motion.div>
						)}

						<div className='mt-3'>
							<AnimatePresence mode='wait' initial={false}>
								{showFound || String(search).trim() ? (
									<motion.div
										key='found'
										layout='position'
										variants={FX}
										initial='initial'
										animate='enter'
										exit='exit'
									>
										<FoundSection
											products={applySort(
												Array.isArray(foundItems) ? foundItems : [],
												sortKey
											)}
											onSelectProduct={openDetails}
										/>
									</motion.div>
								) : view === 'home' ? (
									<motion.div
										key='home'
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
												<ProductSection
													title={sec.title}
													products={sec.items}
													onSelectProduct={openDetails}
													onOpenSubcategory={openSubcategory}
													loading={status === 'loading'}
													showHeader={norm(sec.title) !== PROMO_KEY}
												/>
											</motion.div>
										))}
									</motion.div>
								) : (
									<motion.div
										key='sub'
										layout='position'
										variants={FX}
										initial='initial'
										animate='enter'
										exit='exit'
									>
										<SubcategoryPanel
											title={activeSub?.title}
											products={subSorted}
											onSelectProduct={openDetails}
											onOpenFilters={() => {
												dispatch(setShowFound(false))
												onToggleFilters?.()
											}}
											filtersOpen={!!filtersOpen}
											sortKey={sortKey}
											onChangeSort={setSortKey}
										/>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				</motion.div>

				<AnimatePresence initial={false} mode='wait'>
					{selectedProduct && (
						<div className='absolute inset-0 z-10 bg-white'>
							<motion.div
								key='details-content'
								variants={FX}
								initial='initial'
								animate='enter'
								exit='exit'
								className='h-full'
								style={{ willChange: 'opacity' }}
							>
								<ProductDetails
									product={selectedProduct}
									related={related}
									onBack={closeDetails}
									onOpenSubcategory={payload => {
										closeDetails()
										dispatch(setShowFound(false))
										openSubcategory(payload?.title || selectedProduct.category)
									}}
									onSelectProduct={openDetails}
								/>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>
		</LayoutGroup>
	)
}

export default ProductsPage
