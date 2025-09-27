// src/components/ProductsPage/ProductPage.jsx
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

import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import ProductDetails from '../ProductDetails/ProductDetails'
import ProductSection from '../ProductSection/ProductSection'
import PromoSlider from '../PromoSlider/PromoSlider'
import SubcategoryPanel from '../SubcategoryPanel/SubcategoryPanel'
import SortDropdown from '../ui/SortDropdown'

const ProductsPage = ({
	onToggleFilters,
	onDetailsModeChange,
	externalSelectedProduct,
	onConsumeExternalSelected,
	overlayFilters = {},
	overlayFiltersPreview = {},
	onFiltersCountChange = () => {},
	filtersOpen,
	showSlider = false,
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

	useEffect(() => {
		onDetailsModeChange?.(Boolean(selectedProduct))
	}, [selectedProduct, onDetailsModeChange])

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
		if (!search.trim()) return
		setSelectedProduct(null)
		setActiveSub(null)
	}, [search])

	const related = useRelated(allItems, selectedProduct, 10)

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

	const activeList = useMemo(
		() => (Array.isArray(activeSub?.products) ? activeSub.products : []),
		[activeSub]
	)

	const filteredApplied = useMemo(
		() => applyAdvancedFilter(activeList, overlayFilters),
		[activeList, overlayFilters]
	)
	const sortedApplied = useMemo(
		() => applySort(filteredApplied, sortKey),
		[filteredApplied, sortKey]
	)

	const filteredPreview = useMemo(
		() => applyAdvancedFilter(activeList, overlayFiltersPreview),
		[activeList, overlayFiltersPreview]
	)
	useEffect(() => {
		if (activeSub) onFiltersCountChange(filteredPreview.length)
	}, [activeSub, filteredPreview.length, onFiltersCountChange])

	const openDetails = useCallback(p => setSelectedProduct(p), [])
	const closeDetails = useCallback(() => setSelectedProduct(null), [])

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

			setSelectedProduct(null)
			setActiveSub({
				title: title || 'Категория',
				products: Array.isArray(products) ? products : [],
			})
		},
		[allItems]
	)

	const closeSubcategory = useCallback(() => setActiveSub(null), [])

	// Единый эффект (как у «Посмотреть ещё»)
	const FX = {
		initial: { opacity: 0, y: 8 },
		enter: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.18, ease: 'easeOut' },
		},
		exit: { opacity: 0, y: 8, transition: { duration: 0.14, ease: 'easeIn' } },
	}

	const shouldShowSlider =
		!!showSlider && !selectedProduct && !activeSub && !String(search).trim()

	const FilterBar = (
		<div className='flex items-center gap-2 p-2.5'>
			<div className='pl-2.5 text-lg font-baron' />
			<div className='ml-auto flex items-center gap-2'>
				<button
					type='button'
					onClick={() => onToggleFilters?.(!filtersOpen)}
					className={[
						'w-16 h-6 px-[5px] py-1 rounded-[10px] font-baron text-[10px]',
						filtersOpen ? 'bg-[#EFEBE7] text-[#BD52E9]' : 'btn-firework-filter',
					].join(' ')}
				>
					<span>фильтр</span>
				</button>
				<SortDropdown value={sortKey} onChange={setSortKey} />
			</div>
		</div>
	)

	const view = activeSub ? 'sub' : 'home'

	// ⬇️ Лочим скролл страницы при открытой карточке + компенсируем ширину скроллбара
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

	return (
		<LayoutGroup id='products-page'>
			{/* фиксированная минимальная высота — страница не «прыгает» при оверлее */}
			<div
				className={`relative rounded-[20px] overflow-hidden bg-white ${
					selectedProduct ? 'h-[834px]' : 'min-h-[834px]'
				}`}
			>
				{/* ==== БАЗОВЫЙ СЛОЙ (HOME/SUB) — всегда смонтирован. Замораживаем, когда открыт details. ==== */}
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
						<AnimatePresence mode='wait' initial={false}>
							{view === 'sub' ? (
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
										products={sortedApplied}
										onClose={closeSubcategory}
										onSelectProduct={openDetails}
										onOpenFilters={() => onToggleFilters?.(!filtersOpen)}
										sort={sortKey}
										onChangeSort={setSortKey}
										filtersOpen={filtersOpen}
									/>
								</motion.div>
							) : (
								<motion.div
									key='home'
									layout='position'
									variants={FX}
									initial='initial'
									animate='enter'
									exit='exit'
								>
									<motion.div layout='position'>
										<AnimatePresence mode='wait' initial={false}>
											{shouldShowSlider ? (
												<motion.div
													key='slider'
													layout='position'
													variants={FX}
													initial='initial'
													animate='enter'
													exit='exit'
												>
													<PromoSlider active />
												</motion.div>
											) : (
												<motion.div
													key='filterbar'
													layout='position'
													variants={FX}
													initial='initial'
													animate='enter'
													exit='exit'
												>
													{FilterBar}
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>

									<motion.div layout='position' className='mt-4 space-y-6'>
										{sections.map(sec => (
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
													onOpenSubcategory={payload =>
														openSubcategory(
															payload ?? {
																title: sec.title,
																products: sec.items,
															}
														)
													}
													loading={status === 'loading'}
												/>
											</motion.div>
										))}
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
				</motion.div>

				{/* ==== ДЕТАЛИ — абсолютный непрозрачный оверлей, анимируем контент. ==== */}
				<AnimatePresence initial={false} mode='wait'>
					{selectedProduct && (
						<div className='absolute inset-0 z-10 bg-white '>
							<motion.div
								key='details-content'
								variants={FX}
								initial='initial'
								animate='enter'
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
