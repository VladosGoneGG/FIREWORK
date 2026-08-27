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
import useStickToBottom from './utils/useStickToBottom'

// =============================
// Константы размеров
// =============================
const COLUMN_HEIGHT = 834
const DETAILS_HEIGHT = 834

function App() {
	const [detailsMode, setDetailsMode] = useState(false)
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const [selectedFromSearch, setSelectedFromSearch] = useState(null)
	const [isLanding, setIsLanding] = useState(true)

	const { ref: centerRef, height: centerHeight } = useStickToBottom(
		COLUMN_HEIGHT,
		19
	)

	const selectedCategory = useSelector(
		s => s.categories.selectedCategory || 'all'
	)
	const searchQuery = useSelector(s => s.products.searchQuery || '')

	const showSliderOnHome =
		isLanding &&
		selectedCategory === 'all' &&
		!detailsMode &&
		!filtersOpen &&
		!searchOpen &&
		!String(searchQuery).trim()

	const gridNormal = '[grid-template-columns:240px_minmax(449px,665px)_295px]'
	const gridDetails = '[grid-template-columns:minmax(709px,925px)_295px]'

	return (
		<div className='flex flex-col items-center min-h-screen scroll-hidden '>
			<Header rightSlot={<SearchBar />} />

			<div className='w-full px-2.5 overflow-visible'>
				<div className='overflow-x-auto'>
					<main
						className={[
							'mx-auto w-full pb-[20px]',
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
									style={{ height: COLUMN_HEIGHT }}
								>
									{!filtersOpen && (
										<>
											<CategoryFilter
												onAnyCategoryClick={() => setIsLanding(false)}
											/>
											<PromoPanel />
										</>
									)}

									<SubcategoryOverlay
										isOpen={filtersOpen}
										onClose={() => setFiltersOpen(false)}
										onApply={() => setIsLanding(false)}
										onReset={() => setIsLanding(false)}
									/>
								</div>
							</div>
						)}

						{/* ЦЕНТР — одна и та же ProductsPage, но разное поведение скролла/отступа */}
						<div className='scroll-hidden bg-transparent flex flex-col w-full overflow-visible pt-[2px] -mt-[2px]  '>
							<div
								ref={centerRef}
								className='relative z-10 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-[20px] flex flex_col bg-white w-full overflow-visible'
								style={{
									height: detailsMode ? 'auto' : centerHeight,
									marginBottom: detailsMode ? 0 : 10,
								}}
							>
								<div className='flex-1 rounded-[20px] min-h-0 overflow-hidden'>
									<div
										className={[
											'h-full',
											detailsMode
												? 'overflow-visible'
												: 'overflow-y-auto scroll-hidden mt-[10px] rounded-[20px]',
										].join(' ')}
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
											filtersOpen={filtersOpen}
											showSlider={showSliderOnHome}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* ПРАВАЯ КОЛОНКА — 295px по макету */}
						<aside className='sticky top-0'>
							<div className='w-[295px]' style={{ height: COLUMN_HEIGHT }}>
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
