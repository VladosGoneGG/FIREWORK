// src/App.jsx
import { useState } from 'react'
import { useSelector } from 'react-redux'
import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import FooterSection from './components/FooterSection/FooterSection'
import Header from './components/Header/Header'
import ProductCart from './components/ProductCart/ProductCart'
import ProductsPage from './components/ProductsPage/ProductPage'
import PromoPanel from './components/PromoPanel/PromoPanel'
import SearchBar from './components/Search/SearchBar'
import SearchModal from './components/Search/SearchModal'
import SubcategoryOverlay from './components/SubcategoryOverlay/SubcategoryOverlay'
import useOverlayFilters from './hooks/useOverlayFilters'

const HEADER_H = 140
const CENTER_W = 720
const DETAILS_W = 1010
const DETAILS_H = 834
const COLUMN_H = 834

function App() {
	const [detailsMode, setDetailsMode] = useState(false)
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const [selectedFromSearch, setSelectedFromSearch] = useState(null)
	const [isLanding, setIsLanding] = useState(true) // ← добавили

	const selectedCategory = useSelector(
		s => s.categories.selectedCategory || 'all'
	)
	const searchQuery = useSelector(s => s.products.searchQuery || '')

	const { form, setField, reset: resetForm, normalized } = useOverlayFilters()
	const [appliedFilters, setAppliedFilters] = useState({})
	const [overlayCount, setOverlayCount] = useState(0)

	const applyOverlay = () => setAppliedFilters(normalized)
	const clearOverlay = () => {
		resetForm()
		setAppliedFilters({})
	}

	// Слайдер только на самом первом экране (isLanding=true) и когда реально "домой":
	const showSliderOnHome =
		isLanding &&
		selectedCategory === 'all' &&
		!detailsMode &&
		!filtersOpen &&
		!searchOpen &&
		!String(searchQuery).trim()

	return (
		<div className='flex flex-col items-center min-h-screen scroll-hidden overflow-y-auto '>
			<Header rightSlot={<SearchBar />} />

			<div className='flex mt-[20px] w-full justify-center '>
				<main className='flex w-[1240px] justify-center gap-5'>
					{/* ЛЕВАЯ КОЛОНКА */}
					<div
						className={`sticky ${detailsMode ? 'hidden' : 'block'}`}
						style={{ top: HEADER_H }}
					>
						<div className='relative w-[240px]' style={{ height: COLUMN_H }}>
							{!filtersOpen && (
								<>
									<CategoryFilter
										onAnyCategoryClick={() => setIsLanding(false)} // ← сигнал: ушли с лендинга
									/>
									<PromoPanel />
								</>
							)}

							<SubcategoryOverlay
								isOpen={filtersOpen}
								onClose={() => setFiltersOpen(false)}
								onApply={() => {
									setIsLanding(false)
									applyOverlay()
								}} // фильтры = не лендинг
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

					{/* ЦЕНТР */}
					<div
						className='scroll-hidden bg-transparent flex flex-col'
						style={{ width: DETAILS_W }}
					>
						<div
							className='relative z-10 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-[20px] flex flex-col bg-white'
							style={{ height: detailsMode ? DETAILS_H : COLUMN_H }}
						>
							<div className='flex-1 min-h-0 overflow-y-auto scroll-hidden rounded-[20px] '>
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
									onConsumeExternalSelected={() => setSelectedFromSearch(null)}
									overlayFilters={appliedFilters}
									onFiltersCountChange={setOverlayCount}
									filtersOpen={filtersOpen}
									narrow={!detailsMode}
									narrowWidth={CENTER_W}
									showSlider={showSliderOnHome} // ← только на лендинге
								/>
							</div>
						</div>

						{!detailsMode && (
							<div className='mb-[20px] relative z-0 '>
								<FooterSection />
							</div>
						)}
					</div>

					{/* ПРАВАЯ КОЛОНКА */}
					<aside className='w-80 sticky' style={{ top: HEADER_H }}>
						<div style={{ height: COLUMN_H }}>
							<ProductCart />
						</div>
					</aside>
				</main>
			</div>

			<SearchModal
				isOpen={searchOpen}
				onClose={() => setSearchOpen(false)}
				onSelectProduct={p => {
					setIsLanding(false) // выбор из поиска — тоже не лендинг
					setSelectedFromSearch(p)
					setSearchOpen(false)
				}}
			/>
		</div>
	)
}

export default App
