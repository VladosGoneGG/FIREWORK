import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import {
	fetchProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'
import ProductSection from '../ProductSection/ProductSection'

const ProductsPage = () => {
	const dispatch = useDispatch()
	const status = useSelector(s => s.products.status)
	const products = useSelector(selectFilteredProducts)

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchProducts())
			dispatch(fetchCategories()) // чтобы список был под фильтр
		}
	}, [status, dispatch])

	if (status === 'loading') {
		return (
			<div className='bg-white rounded-xl p-4 shadow'>Загрузка товаров...</div>
		)
	}

	if (status === 'failed') {
		return <div className='bg-white rounded-xl p-4 shadow'>Ошибка загрузки</div>
	}

	return (
		<div>
			<ProductSection title='Товары' products={products} />
		</div>
	)
}

export default ProductsPage
