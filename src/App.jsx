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

// Константы макета
const HEADER_H = 140
const COLUMN_H = 834 // фикс-высота видимой области центра/колонок
const CENTER_MAX_HOME = 665 // центр на Home/листе
const DETAILS_CENTER_W_XL = 1010 // центр на деталях (xl)
const CART_W_MD = 260
const CART_W_XL = 320

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

	// ── шаблоны сетки
	const gridNormal =
		'md:[grid-template-columns:220px_minmax(240px,665px)_260px] ' + // md–lg
		'xl:[grid-template-columns:240px_665px_320px]' // xl

	// В деталях — левой колонки нет: остаётся 2 колонки (центр + корзина)
	const gridDetails =
		'md:[grid-template-columns:minmax(480px,1010px)_' +
		CART_W_MD +
		'px] ' + // md–lg
		`xl:[grid-template-columns:${DETAILS_CENTER_W_XL}px_${CART_W_XL}px]` // xl

	// ширина контейнера: считаем с gap-x-5 (20px)
	const maxWidthNormal = 'xl:max-w-[1265px]' // 240 + 665 + 320 + 2*20 = 1265
	const maxWidthDetails = 'xl:max-w-[1350px]' // 1010 + 320 + 20 = 1350

	return (
		<div className='flex flex-col min-h-screen overflow-x-hidden'>
			<Header rightSlot={<SearchBar />} />

			<div className='mt-[20px] w-full'>
				<main
					className={[
						'mx-auto w-full',
						// На xl убираем боковые паддинги, чтобы совпадать с контейнером хедера
						'px-2.5 md:px-3 lg:px-4 xl:px-0',

						// <md — одна колонка, md+ — grid
						'flex flex-col gap-4',
						'md:grid md:items-start',

						// Горизонтальный зазор между колонками ровно 20px
						'md:gap-x-5 md:gap-y-4',
						'xl:gap-x-5 xl:gap-y-4',

						// Переключение раскладки и общей ширины по режиму
						detailsMode ? gridDetails : gridNormal,
						detailsMode ? maxWidthDetails : maxWidthNormal,
					].join(' ')}
				>
					{/* ── ЛЕВАЯ КОЛОНКА: скрываем ТОЛЬКО в режиме деталей */}
					{!detailsMode && (
						<div
							className='hidden md:block sticky z-[1]'
							style={{ top: HEADER_H }}
						>
							{/* sticky на ширину трека */}
							<div className='relative w-full' style={{ height: COLUMN_H }}>
								{/* Контент вписывается в трек: md 220px, xl 240px */}
								<div className='md:w-[220px] xl:w-[240px]'>
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
						</div>
					)}

					{/* ── ЦЕНТР: фикс-высота 834, внутренняя прокрутка (скрытый скроллбар) */}
					<div className='flex flex-col bg-transparent w-full'>
						<div
							className='
                relative md:z-0 xl:z-10
                shadow-[0_0_10px_0_rgba(0,0,0,0.2)]
                rounded-[20px] bg-white flex flex-col w-full
              '
							style={{ height: COLUMN_H }}
						>
							<div className='flex-1 min-h-0 overflow-y-auto scroll-hidden rounded-[20px]'>
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
									overlayFiltersPreview={normalized}
									onFiltersCountChange={setOverlayCount}
									filtersOpen={filtersOpen}
									narrow={!detailsMode}
									narrowWidth={CENTER_MAX_HOME}
									showSlider={showSliderOnHome}
								/>
							</div>
						</div>

						{/* Футер рендерим только вне деталей — как раньше */}
						{!detailsMode && (
							<div className='mb-[20px] relative z-0'>
								<FooterSection />
							</div>
						)}
					</div>

					{/* ── ПРАВАЯ КОЛОНКА (КОРЗИНА): ВСЕГДА видима на md+, в деталях тоже */}
					<aside
						className='hidden md:block sticky z-[2]'
						style={{ top: HEADER_H }}
					>
						<div
							className='w-full md:w-[260px] xl:w-[320px]'
							style={{ height: COLUMN_H }}
						>
							<ProductCart />
						</div>
					</aside>
				</main>
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
