import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import Header from './components/Header/Header'
import ProductCart from './components/ProductCart/ProductCart'
import ProductsPage from './components/ProductsPage/ProductPage'
import PromoPanel from './components/PromoPanel/PromoPanel'

function App() {
	return (
		<div className='flex items-center flex-col'>
			<Header />
			<div className='flex mt-[20px]'>
				<main className='flex w-[1240px]  justify-center gap-5'>
					<div>
						<CategoryFilter />
						<PromoPanel />
					</div>

					<div className='w-[665px]'>
						<ProductsPage />
					</div>

					<aside className='w-80'>
						<ProductCart />
					</aside>
				</main>
			</div>
		</div>
	)
}

export default App
