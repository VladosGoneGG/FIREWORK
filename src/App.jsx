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
		19,
	)

	const selectedCategory = useSelector(
		s => s.categories.selectedCategory || 'all',
	)
	const searchQuery = useSelector(s => s.products.searchQuery || '')

	const showSliderOnHome =
		isLanding &&
		selectedCategory === 'all' &&
		!detailsMode &&
		!filtersOpen &&
		!searchOpen &&
		!String(searchQuery).trim()

	// Оба шаблона держат одинаковое число треков (3), только ширина первого
	// (категории) едет 240px → 0px — иначе grid-template-columns не может
	// анимироваться плавно между разным числом колонок, и раскладка "прыгает"
	// вместе с карточкой товара.
	const gridNormal = '[grid-template-columns:240px_minmax(449px,665px)_295px]'
	const gridDetails = '[grid-template-columns:0px_minmax(709px,925px)_295px]'

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
							'transition-[grid-template-columns] duration-300 ease-in-out',
							detailsMode ? gridDetails : gridNormal,
						].join(' ')}
					>
						{/* ЛЕВАЯ КОЛОНКА — в режиме деталей остаётся смонтированной (чтобы
						    колонка грида не исчезала мгновенно вместе с текстом), но едет
						    прозрачностью в 0, пока её трек сжимается до 0px (см. gridDetails
						    выше) — список товаров рядом из-за этого не дёргается, а плавно
						    занимает освободившееся место.
						    ВАЖНО: тут раньше стоял overflow-hidden — думали, что он нужен
						    только чтобы обрезать эту колонку по мере сжатия трека во время
						    перехода. На деле он ещё и обрезал box-shadow у CategoryFilter/
						    PromoPanel по бокам в обычном режиме (0px зазора между их 240px
						    и точно таким же 240px враппером — тени банально некуда было
						    рендериться). Переход и так скрывается прозрачностью (0.3s),
						    поэтому overflow тут не нужен вовсе. */}
						<div
							className={[
								'sticky top-0',
								'transition-opacity duration-300 ease-in-out',
								detailsMode ? 'opacity-0 pointer-events-none' : 'opacity-100',
							].join(' ')}
						>
							<div
								className='relative w-[240px]'
								style={{ height: centerHeight }}
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

						{/* ЦЕНТР — одна и та же ProductsPage, но разное поведение скролла/отступа.
						    В режиме деталей колонка категорий сжата до 0px, но
						    gap-x-5 перед этим треком (20px) никуда не девается — без
						    компенсации карточка визуально начиналась бы на 20px правее
						    левого края хедера. Отрицательный margin-left "съедает" этот
						    зазор, ширина компенсирована, чтобы правый край (у корзины)
						    не сдвинулся. */}
						<div
							className={[
								'scroll-hidden bg-transparent flex flex-col overflow-visible pt-[2px] -mt-[2px]',
								'transition-[margin-left,width] duration-300 ease-in-out',
							].join(' ')}
							style={{
								marginLeft: detailsMode ? '-20px' : '0px',
								width: detailsMode ? 'calc(100% + 20px)' : '100%',
							}}
						>
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
							<div
								className='w-[295px] transition-[height] duration-300 ease-in-out'
								style={{ height: detailsMode ? DETAILS_HEIGHT : centerHeight }}
							>
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
