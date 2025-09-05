import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import FooterSection from './components/FooterSection/FooterSection'
import Header from './components/Header/Header'
import ProductCart from './components/ProductCart/ProductCart'
import ProductDetails from './components/ProductDetails/ProductDetails'
import ProductsPage from './components/ProductsPage/ProductPage'
import PromoMain from './components/PromoMain/PromoMain'
import PromoPanel from './components/PromoPanel/PromoPanel'

const HEADER_H = 140
const CENTER_W = 750
const DETAILS_W = 1000
const DETAILS_H = 834

function App() {
	const [selectedProduct, setSelectedProduct] = useState(null)

	const allItems = useSelector(s => s.products.items)
	const related = useMemo(() => {
		if (!selectedProduct) return []
		return allItems
			.filter(
				p =>
					p.id !== selectedProduct.id &&
					(p.subcategory || '').toLowerCase() ===
						(selectedProduct.subcategory || '').toLowerCase()
			)
			.slice(0, 10)
	}, [allItems, selectedProduct])

	return (
		<div className='flex flex-col items-center h-screen overflow-hidden'>
			<Header />

			<div className='flex mt-[20px] w-full justify-center'>
				<main className='flex w-[1240px] justify-center gap-5'>
					{/* Левая колонка (прячем при деталях) */}
					<div
						className={`sticky ${selectedProduct ? 'hidden' : ''}`}
						style={{ top: HEADER_H }}
					>
						<CategoryFilter />
						<PromoPanel />
					</div>

					{/* Центр-колонка: ТОЛЬКО скролл и центрирование контента */}
					<div
						className='
              scroll-hidden overflow-y-auto
              bg-transparent rounded-[20px]
              shadow-[0_0_10px_0_rgba(0,0,0,0.2)]
              flex flex-col items-center
            '
						style={{
							width: selectedProduct ? DETAILS_W : CENTER_W,
							height: selectedProduct
								? DETAILS_H
								: `calc(100vh - ${HEADER_H}px)`,
						}}
					>
						{/* Листинг товаров */}
						{!selectedProduct ? (
							<div className='bg-white rounded-[20px] p-3 w-full'>
								<PromoMain />
								<ProductsPage onSelectProduct={setSelectedProduct} />
							</div>
						) : (
							// Детали товара — СЕКЦИЯ САМА РОВНО 925px
							<div className='w-full flex justify-center items-start'>
								<ProductDetails
									related={related}
									product={selectedProduct}
									onBack={() => setSelectedProduct(null)}
								/>
							</div>
						)}

						{/* Футер в режиме листинга */}
						{!selectedProduct && (
							<div className='mt-3 w-full'>
								<FooterSection />
							</div>
						)}
					</div>

					{/* Правая колонка (корзина) */}
					<aside className='w-80 sticky' style={{ top: HEADER_H }}>
						<ProductCart />
					</aside>
				</main>
			</div>
		</div>
	)
}
export default App
