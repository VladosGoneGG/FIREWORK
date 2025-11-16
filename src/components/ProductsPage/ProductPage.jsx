import {
	AnimatePresence,
	LayoutGroup,
	motion,
	MotionConfig,
} from 'motion/react'
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

import { useStaticPageKey } from '../../pages/StaticPageContext'
import StaticContactsBlock from './static/StaticContactsBlock'
import StaticWholesaleBlock from './static/StaticWholesaleBlock'

const PROMO_KEY = 'акции'
const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()

const EASE = 'easeOut'
const DURATION = 0.15

const BLOCK = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { ease: EASE, duration: DURATION } },
	exit: {
		opacity: 0,
		y: -8,
		transition: { ease: EASE, duration: DURATION * 0.8 },
	},
}

const LAYOUT_T = { layout: { duration: DURATION, ease: EASE } }

const ProductsPage = ({
	onToggleFilters,
	filtersOpen,
	onFiltersCountChange = () => {},
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
	showSlider = true,
	pageKey: pageKeyProp = null, // опционально через проп (сохраняю совместимость)
}) => {
	useProductsBoot()

	const dispatch = useDispatch()
	const pageKeyCtx = useStaticPageKey()
	const pageKey = pageKeyProp ?? pageKeyCtx ?? null

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

	const view = activeSub ? 'sub' : 'home'
	const animKey = `${view}-${norm(selected)}-${sortKey}-${
		showFound ? 'found' : 'no-found'
	}-${String(search).trim() ? 'q' : 'noq'}`

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

	useEffect(() => {
		const q = String(search).trim()
		if (q) {
			dispatch(clearApplied())
			dispatch(setCategorySmart('all'))
			try {
				window.dispatchEvent(
					new CustomEvent('nav:category-picked', {
						detail: { category: 'all' },
					})
				)
			} catch {}
			dispatch(setShowFound(true))
			setSelectedProduct(null)
			setActiveSub(null)
		} else {
			dispatch(setShowFound(false))
		}
	}, [search, dispatch])

	useEffect(() => {
		onFiltersCountChange(previewCount)
	}, [previewCount, onFiltersCountChange])

	const related = useRelated(allItems, selectedProduct, 10)

	const shouldShowSlider =
		!!showSlider &&
		!selectedProduct &&
		!activeSub &&
		!String(search).trim() &&
		!showFound

	const homeFiltered = useMemo(() => applyFilters(filtered, {}), [filtered])

	const hasStaticPage = !!pageKey

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
	const showHeaderFor = title =>
		norm(title) !== PROMO_KEY || shouldShowSlider || hasStaticPage

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
				dispatch(setCategorySmart(title))
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

	useEffect(() => {
		const onOpenSub = e => {
			const title = e?.detail?.title
			if (!title) return
			setSelectedProduct(null)
			openSubcategory({ title })
		}
		window.addEventListener('nav:open-subcategory', onOpenSub)
		return () => window.removeEventListener('nav:open-subcategory', onOpenSub)
	}, [openSubcategory])

	useEffect(() => {
		const onPicked = () => {
			setActiveSub(null)
			setSelectedProduct(null)
		}
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
		<MotionConfig transition={{ duration: DURATION, ease: EASE }}>
			<LayoutGroup id='products-page'>
				<div
					ref={anchorRef}
					className={`relative bg-white rounded-[20px] pb-2.5 overflow-hidden mx-auto 
           w/full max-w-[1200px] px-4 lg:px-3 md:px-2
          ${selectedProduct ? 'h-[834px]' : 'min-h-[834px]'}`}
				>
					<motion.div layout='position' transition={LAYOUT_T}>
						<motion.div
							layout='position'
							transition={LAYOUT_T}
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
									key={`top-${animKey}`}
									variants={BLOCK}
									initial='hidden'
									animate='show'
									exit='exit'
									layout='position'
									transition={LAYOUT_T}
								>
									{hasStaticPage ? null : shouldShowSlider ? ( // на статике показываем обычную панель (как у каталога)
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
											key={`found-${animKey}`}
											layout='position'
											transition={LAYOUT_T}
											variants={BLOCK}
											initial='hidden'
											animate='show'
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
									) : hasStaticPage ? (
										<motion.div
											key={`static-${pageKey}-${animKey}`}
											layout='position'
											transition={LAYOUT_T}
											variants={BLOCK}
											initial='hidden'
											animate='show'
											exit='exit'
											className='space-y-6'
										>
											{pageKey === 'contacts' && (
												<div>
													<StaticContactsBlock />
												</div>
											)}
											{pageKey === 'wholesale' && (
												<div>
													<StaticWholesaleBlock />
												</div>
											)}
										</motion.div>
									) : view === 'home' ? (
										<motion.div
											key={`home-${animKey}`}
											layout='position'
											transition={LAYOUT_T}
											variants={BLOCK}
											initial='hidden'
											animate='show'
											exit='exit'
											className='space-y-6'
										>
											{sectionsSorted.map(sec => (
												<div key={sec.title}>
													<ProductSection
														title={sec.title}
														products={sec.items}
														onSelectProduct={openDetails}
														onOpenSubcategory={openSubcategory}
														loading={status === 'loading'}
														showHeader={showHeaderFor(sec.title)}
													/>
												</div>
											))}
										</motion.div>
									) : (
										<motion.div
											key={`sub-${animKey}`}
											layout='position'
											transition={LAYOUT_T}
											variants={BLOCK}
											initial='hidden'
											animate='show'
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
									variants={BLOCK}
									initial='hidden'
									animate='show'
									exit='exit'
									className='h-full'
									style={{ willChange: 'opacity, transform' }}
								>
									<ProductDetails
										product={selectedProduct}
										related={related}
										onBack={closeDetails}
										onOpenSubcategory={payload => {
											closeDetails()
											dispatch(setShowFound(false))
											openSubcategory(
												payload?.title || selectedProduct.category
											)
										}}
										onSelectProduct={openDetails}
									/>
								</motion.div>
							</div>
						)}
					</AnimatePresence>
				</div>
			</LayoutGroup>
		</MotionConfig>
	)
}

export default ProductsPage
