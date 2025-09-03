import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import Header from './components/Header/Header'
import ProductCart from './components/ProductCart/ProductCart'
import ProductsPage from './components/ProductsPage/ProductPage'
import PromoMain from './components/PromoMain/PromoMain'
import PromoPanel from './components/PromoPanel/PromoPanel'

function App() {
	return (
		<div className='flex items-center flex-col h-screen overflow-hidden'>
			<Header />
			<div className='flex mt-[20px]'>
				<main className='flex w-[1240px]  justify-center gap-5'>
					<div className='sticky top-[140px]'>
						<CategoryFilter />
						<PromoPanel />
					</div>

					<div className='w-[722px] rounded-t-[20px] h-[calc(100vh-140px)] overflow-y-auto scroll-hidden bg-white flex flex-col items-center'>
						<PromoMain />
						<ProductsPage />
					</div>

					<aside className='w-80 sticky top-[140px]'>
						<ProductCart />
					</aside>
				</main>
			</div>
		</div>
	)
}

export default App
