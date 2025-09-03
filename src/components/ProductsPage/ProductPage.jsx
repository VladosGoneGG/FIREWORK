import { useEffect, useMemo } from 'react'
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
	const selected = useSelector(s => s.categories.selectedCategory || 'all')
	const filtered = useSelector(selectFilteredProducts)

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchProducts())
			dispatch(fetchCategories())
		}
	}, [status, dispatch])

	const sections = useMemo(() => {
		const sel = (selected || 'all').toLowerCase()
		if (sel !== 'all') {
			return [{ title: sel[0].toUpperCase() + sel.slice(1), items: filtered }]
		}
		// группировка по родительской категории
		const map = new Map()
		for (const p of filtered) {
			const key = p.category || 'Без категории'
			if (!map.has(key)) map.set(key, [])
			map.get(key).push(p)
		}
		return Array.from(map.entries()).map(([title, items]) => ({ title, items }))
	}, [filtered, selected])

	if (status === 'loading')
		return (
			<div className='bg-white rounded-xl p-4 shadow'>Загрузка товаров...</div>
		)
	if (status === 'failed')
		return <div className='bg-white rounded-xl p-4 shadow'>Ошибка загрузки</div>

	return (
		<div className='space-y-6'>
			{sections.map(sec => (
				<ProductSection
					key={sec.title}
					title={sec.title}
					products={sec.items}
				/>
			))}
		</div>
	)
}

export default ProductsPage
