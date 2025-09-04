import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import FooterSection from './components/FooterSection/FooterSection '
import Header from './components/Header/Header'
import ProductCart from './components/ProductCart/ProductCart'
import ProductsPage from './components/ProductsPage/ProductPage'
import PromoMain from './components/PromoMain/PromoMain'
import PromoPanel from './components/PromoPanel/PromoPanel'

const HEADER_H = 140
const CENTER_W = 665 // твоя ширина по макету

function App() {
	return (
		<div className='flex flex-col items-center h-screen overflow-hidden'>
			<Header />

			<div className='flex mt-[20px] w-full justify-center'>
				<main className='flex w-[1240px] justify-center gap-5'>
					<div className='sticky' style={{ top: HEADER_H }}>
						<CategoryFilter />
						<PromoPanel />
					</div>

					{/* центральная колонка скроллится, футер внутри */}
					<div
						className='overflow-y-auto scroll-hidden bg-transparent shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-[20px]'
						style={{ width: CENTER_W, height: `calc(100vh - ${HEADER_H}px)` }}
					>
						{/* секция с баннером/товарами */}
						<div className='bg-white rounded-[20px] p-3 '>
							<PromoMain />
							<ProductsPage />
						</div>

						{/* футер как отдельная «секция» */}
						<FooterSection />
					</div>

					<aside className='w-80 sticky' style={{ top: HEADER_H }}>
						<ProductCart />
					</aside>
				</main>
			</div>
		</div>
	)
}
export default App
