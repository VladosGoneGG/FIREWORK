// src/App.jsx
import { useState } from 'react'
import { useSelector } from 'react-redux'

import CategoryFilter from './components/CategoryFilter/CategoryFilter'

import Header from './components/Header/Header'
import ProductCart from './components/ProductCart/ProductCart'
import ProductsPage from './components/ProductsPage/ProductPage'
import PromoPanel from './components/PromoPanel/PromoPanel'
import SearchBar from './components/Search/SearchBar'
import SearchModal from './components/Search/SearchModal'
import SubcategoryOverlay from './components/SubcategoryOverlay/SubcategoryOverlay'

import useOverlayFilters from './hooks/useOverlayFilters'

const COLUMN_H = 834
const DETAILS_H = 834
const CENTER_W = 720 // информативный проп для ProductsPage

function App() {
	const [detailsMode, setDetailsMode] = useState(false)
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const [selectedFromSearch, setSelectedFromSearch] = useState(null)
	const [isLanding, setIsLanding] = useState(true)

	const selectedCategory = useSelector(
		s => s.categories.selectedCategory || 'all'
	)
	const searchQuery = useSelector(s => s.products.searchQuery || '')

	const { form, setField, reset: resetForm, normalized } = useOverlayFilters()
	const [appliedFilters, setAppliedFilters] = useState({})
	const [overlayCount, setOverlayCount] = useState(0)

	const applyOverlay = () => setAppliedFilters({ ...normalized })
	const clearOverlay = () => {
		resetForm()
		setAppliedFilters({})
	}

	const showSliderOnHome =
		isLanding &&
		selectedCategory === 'all' &&
		!detailsMode &&
		!filtersOpen &&
		!searchOpen &&
		!String(searchQuery).trim()

	// 3-колоночный режим: 240 | minmax(449,665) | 295, gap-x = 20
	const gridNormal = '[grid-template-columns:240px_minmax(449px,665px)_295px]'
	// Детали: minmax(709,1010) | 295, gap-x = 20
	const gridDetails = '[grid-template-columns:minmax(709px,925px)_295px]'

	return (
		<div className='flex flex-col items-center min-h-screen scroll-hidden overflow-y-auto'>
			<Header rightSlot={<SearchBar />} />

			<div className='w-full  px-2.5  overflow-visible '>
				<div className='overflow-x-auto'>
					<main
						className={[
							'mx-auto w-full pb-6 ',
							detailsMode
								? 'min-w-[1024px] max-w-[1240px]'
								: 'min-w-[1024px] max-w-[1240px]',
							'px-0',
							'grid items-start gap-x-5 gap-y-5 overflow-visible pt-[20px]',
							detailsMode ? gridDetails : gridNormal,
						].join(' ')}
					>
						{/* ЛЕВАЯ КОЛОНКА — скрываем ТОЛЬКО в режиме деталей */}
						{!detailsMode && (
							<div className='sticky top-0'>
								<div
									className='relative w-[240px]'
									style={{ height: COLUMN_H }}
								>
									{/* когда фильтр ЗАКРЫТ — категории + промопанель */}
									{!filtersOpen && (
										<>
											<CategoryFilter
												onAnyCategoryClick={() => setIsLanding(false)}
											/>
											<PromoPanel />
										</>
									)}

									{/* когда фильтр ОТКРЫТ — только оверлей, PromoPanel скрыта */}
									<SubcategoryOverlay
										isOpen={filtersOpen}
										onClose={() => setFiltersOpen(false)}
										onApply={() => {
											setIsLanding(false)
											applyOverlay()
										}}
										onReset={() => {
											setIsLanding(false)
											clearOverlay()
										}}
										resultsCount={overlayCount}
										form={form}
										setField={setField}
										reset={resetForm}
									/>
								</div>
							</div>
						)}

						{/* ЦЕНТР — фикс высота, внутренняя прокрутка (скрытая полоса) */}
						<div className='scroll-hidden bg-transparent flex flex-col w-full overflow-visible pt-[2px] -mt-[2px] '>
							<div
								className='relative z-10 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-[20px] flex flex_col bg-white w-full overflow-visible'
								style={{ height: detailsMode ? 'auto' : COLUMN_H }}
							>
								<div
									className={`flex-1 rounded-[20px] ${
										detailsMode
											? 'overflow-visible'
											: 'min-h-0 overflow-y-auto scroll-hidden'
									}`}
								>
									<ProductsPage
										externalSelectedProduct={selectedFromSearch}
										onToggleFilters={() => {
											setIsLanding(false)
											setFiltersOpen(v => !v)
										}}
										onDetailsModeChange={on => {
											if (on) setIsLanding(false)
											setDetailsMode(on)
										}}
										onConsumeExternalSelected={() =>
											setSelectedFromSearch(null)
										}
										overlayFilters={appliedFilters}
										overlayFiltersPreview={normalized}
										onFiltersCountChange={setOverlayCount}
										filtersOpen={filtersOpen}
										narrow={!detailsMode}
										narrowWidth={CENTER_W}
										showSlider={showSliderOnHome}
									/>
								</div>
							</div>
						</div>

						{/* ПРАВАЯ КОЛОНКА — 295px по макету */}
						<aside className='sticky top-0'>
							<div className='w-[295px]' style={{ height: COLUMN_H }}>
								<ProductCart />
							</div>
						</aside>
					</main>
				</div>
			</div>

			<SearchModal
				isOpen={searchOpen}
				onClose={() => setSearchOpen(false)}
				onSelectProduct={p => {
					setIsLanding(false)
					setSelectedFromSearch(p)
					setSearchOpen(false)
				}}
			/>
		</div>
	)
}

export default App
