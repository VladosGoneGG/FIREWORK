// src/App.jsx
import { useEffect, useState } from 'react'
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

function App() {
	const [detailsMode, setDetailsMode] = useState(false)
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const [selectedFromSearch, setSelectedFromSearch] = useState(null)
	// --- состояние формы фильтров (живое) ---
	const { form, setField, reset: resetForm, normalized } = useOverlayFilters()

	// --- ПРИМЕНЁННЫЕ фильтры, по которым реально фильтруем SubcategoryPanel ---
	const [appliedFilters, setAppliedFilters] = useState({}) // пустой = нет фильтров
	const [overlayCount, setOverlayCount] = useState(0)

	// применить (кнопка "показать")
	const applyOverlay = () => {
		setAppliedFilters(normalized) // применяем то, что ввели в форме
	}

	// сбросить (кнопка "сбросить все")
	const clearOverlay = () => {
		resetForm()
		setAppliedFilters({}) // полностью убираем фильтры → вернётся весь список
	}

	// --- хоткей ctrl+k для глобального поиска ---
	useEffect(() => {
		const onKey = e => {
			if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault()
				setSearchOpen(v => !v)
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [])

	return (
		<div className='flex flex-col items-center h-screen overflow-hidden'>
			<Header
				rightSlot={<SearchBar onOpenModal={() => setSearchOpen(true)} />}
			/>

			<div className='flex mt-[20px] w-full justify-center'>
				<main className='flex w-[1240px] justify-center gap-5'>
					{/* ЛЕВАЯ КОЛОНКА */}
					<div
						className={`sticky ${detailsMode ? 'hidden' : 'block'}`}
						style={{ top: HEADER_H }}
					>
						<div className='relative w-[240px] h-[834px]'>
							{!filtersOpen && (
								<>
									<CategoryFilter />
									<PromoPanel />
								</>
							)}

							<SubcategoryOverlay
								isOpen={filtersOpen}
								onClose={() => setFiltersOpen(false)}
								// ВАЖНО: теперь "показать" и "сбросить" управляют appliedFilters
								onApply={applyOverlay}
								onReset={clearOverlay}
								resultsCount={overlayCount}
								// Живая форма (редактирование инпутов)
								form={form}
								setField={setField}
								reset={resetForm}
							/>
						</div>
					</div>

					{/* ЦЕНТР */}
					<div
						className='scroll-hidden bg-transparent shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-[20px] overflow-y-auto flex flex-col'
						style={{
							width: detailsMode ? DETAILS_W : CENTER_W,
							height: detailsMode ? DETAILS_H : `calc(100vh - ${HEADER_H}px)`,
						}}
					>
						<ProductsPage
							externalSelectedProduct={selectedFromSearch}
							onToggleFilters={() => setFiltersOpen(v => !v)}
							onDetailsModeChange={setDetailsMode}
							onConsumeExternalSelected={() => setSelectedFromSearch(null)}
							// ПРИМЕНЁННЫЕ фильтры отдаём сюда
							overlayFilters={appliedFilters}
							// Кол-во найденных под фильтром (для левого оверлея)
							onFiltersCountChange={setOverlayCount}
						/>

						{!detailsMode && (
							<div className='mt-3'>
								<FooterSection />
							</div>
						)}
					</div>

					{/* ПРАВАЯ КОЛОНКА */}
					<aside className='w-80 sticky' style={{ top: HEADER_H }}>
						<ProductCart />
					</aside>
				</main>
			</div>

			{/* Глобальный поиск */}
			<SearchModal
				isOpen={searchOpen}
				onClose={() => setSearchOpen(false)}
				// 👇 при выборе из модалки — закрываем её и кладём товар в стейт
				onSelectProduct={p => {
					setSelectedFromSearch(p)
					setSearchOpen(false)
				}}
			/>
		</div>
	)
}

export default App
