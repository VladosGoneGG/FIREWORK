// src/components/ProductsPage/ProductPage.jsx
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import useProductsBoot from '../../hooks/useProductsBoot'
import useRelated from '../../hooks/useRelated'
import useSections from '../../hooks/useSections'
import {
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'

import { applyAdvancedFilter as applyFilters } from '../../utils/filters'
import { applySort, SORT_KEYS } from '../../utils/sort'

import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import PromoSlider from '../PromoSlider/PromoSlider'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'
import SortDropdown from '../ui/SortDropdown'

const ProductsPage = ({
	onToggleFilters,
	filtersOpen,
	overlayFilters = {},
	overlayFiltersPreview = {},
	onFiltersCountChange = () => {},
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
	showSlider = true,
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

	const anchorRef = useRef(null)

	useEffect(
		() => onDetailsModeChange?.(Boolean(selectedProduct)),
		[selectedProduct, onDetailsModeChange]
	)
	useEffect(() => {
		setSelectedProduct(null)
		setActiveSub(null)
	}, [selected])
	useEffect(() => {
		if (!externalSelectedProduct) return
		setActiveSub(null)
		setSelectedProduct(externalSelectedProduct)
		onConsumeExternalSelected?.()
	}, [externalSelectedProduct, onConsumeExternalSelected])
	useEffect(() => {
		if (!String(search).trim()) return
		setSelectedProduct(null)
		setActiveSub(null)
	}, [search])

	const related = useRelated(allItems, selectedProduct, 10)

	const view = activeSub ? 'sub' : 'home'
	const shouldShowSlider =
		!!showSlider && !selectedProduct && !activeSub && !String(search).trim()

	// === helpers ===
	const norm = s =>
		String(s || '')
			.trim()
			.toLowerCase()
	const PROMO_KEY = 'акции'

	// === HOME ===
	const homeFiltered = useMemo(
		() => applyFilters(filtered, overlayFilters),
		[filtered, overlayFilters]
	)

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
	const sections = useSections(homeDiscounted, homeNonDiscounted, selected)

	const sectionsSorted = useMemo(
		() =>
			sections.map(sec => ({
				...sec,
				items: applySort(sec.items, sortKey),
			})),
		[sections, sortKey]
	)

	/// === SUB: открытие подкатегории ===
	const openSubcategory = useCallback(
		payload => {
			const norm = s =>
				String(s || '')
					.trim()
					.toLowerCase()
			const PROMO_KEY = 'акции'

			let title = '',
				products = []
			if (typeof payload === 'string') {
				title = payload
			} else if (payload && typeof payload === 'object') {
				title = payload.title || payload.category || ''
				if (Array.isArray(payload.products) && payload.products.length) {
					products = payload.products
				}
			}

			const isPromo = norm(title) === PROMO_KEY

			// Если продукты не передали — поднимем из allItems по тайтлу
			if (!products.length && title) {
				const t = norm(title)
				products = allItems.filter(
					p => norm(p.category) === t || norm(p.subcategory) === t
				)
			}

			// СТРАХОВОЧНЫЙ ФИЛЬТР:
			// - для "акции" — оставить только скидочные
			// - для остальных — убрать скидочные
			if (isPromo) {
				products = products.filter(p => discountedSet.has(p.id))
			} else {
				products = products.filter(p => !discountedSet.has(p.id))
			}

			setSelectedProduct(null)
			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems, discountedSet] // ВАЖНО: добавить discountedSet в зависимости!
	)

	// Промо-секция и "посмотреть ещё" (ТОЛЬКО для HOME/FilterBar)
	const promoSec = useMemo(
		() => sectionsSorted.find(s => norm(s.title) === PROMO_KEY),
		[sectionsSorted]
	)
	const promoHasMore = !!promoSec && promoSec.items.length > 5
	const openPromo = useCallback(() => {
		if (!promoSec) return
		openSubcategory({ title: promoSec.title, products: promoSec.items })
	}, [promoSec, openSubcategory])

	const activeList = useMemo(
		() => (Array.isArray(activeSub?.products) ? activeSub.products : []),
		[activeSub]
	)
	const subFiltered = useMemo(
		() => applyFilters(activeList, overlayFilters),
		[activeList, overlayFilters]
	)
	const subSorted = useMemo(
		() => applySort(subFiltered, sortKey),
		[subFiltered, sortKey]
	)

	// preview counter (overlayFiltersPreview)
	const previewFiltered = useMemo(
		() =>
			applyFilters(
				view === 'home' ? filtered : activeList,
				overlayFiltersPreview
			),
		[view, filtered, activeList, overlayFiltersPreview]
	)
	useEffect(() => {
		onFiltersCountChange(previewFiltered.length)
	}, [previewFiltered.length, onFiltersCountChange])

	const openDetails = useCallback(p => setSelectedProduct(p), [])
	const closeDetails = useCallback(() => setSelectedProduct(null), [])

	const FX = {
		initial: { opacity: 0 },
		enter: { opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } },
		exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
	}

	useEffect(() => {
		if (!selectedProduct) return
		const root = document.documentElement
		const prevOverflow = root.style.overflow
		const prevPadRight = root.style.paddingRight
		const sbw = window.innerWidth - root.clientWidth
		root.style.overflow = 'hidden'
		if (sbw > 0) root.style.paddingRight = `${sbw}px`
		return () => {
			root.style.overflow = prevOverflow
			root.style.paddingRight = prevPadRight
		}
	}, [selectedProduct])

	const FilterBar = (
		<div className='relative'>
			<div className='flex items-start pt-2.5 gap-2 px-2.5'>
				{/* ЛЕВАЯ КОЛОНКА: "акции" + "посмотреть ещё" (только на HOME) */}
				<div className='pl-1 flex-1'>
					{promoSec ? (
						<div className='flex flex-col gap-1'>
							<h3 className='text-[18px] lowercase font-baron leading-none text-black'>
								{promoSec.title}
							</h3>
							{promoHasMore && (
								<button
									type='button'
									onClick={openPromo}
									className='relative top-3 text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'
								>
									посмотреть ещё
								</button>
							)}
						</div>
					) : null}
				</div>

				{/* ПРАВАЯ КОЛОНКА: фильтр + сортировка */}
				<div className='ml-auto flex items-center gap-2'>
					<button
						type='button'
						onClick={onToggleFilters}
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
				{/* ==== ОСНОВНОЙ СЛОЙ ==== */}
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
						{/* HOME: слайдер или фильтр-бар */}
						{view === 'home' && (
							<motion.div
								variants={FX}
								initial='initial'
								animate='enter'
								exit='exit'
								layout='position'
							>
								{shouldShowSlider ? <PromoSlider active /> : FilterBar}
							</motion.div>
						)}

						{/* Контент */}
						<div className='mt-3'>
							<AnimatePresence mode='wait' initial={false}>
								{view === 'home' ? (
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
													showHeader={norm(sec.title) !== PROMO_KEY} // у "акции" хедер скрыт
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
											onOpenFilters={onToggleFilters}
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

				{/* ==== ДЕТАЛИ ==== */}
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
