import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/categoriesSlice'
import {
	fetchProducts,
	selectDiscountedProducts,
	selectFilteredProducts,
} from '../../store/slices/productsSlice'
import ProductSection from '../ProductSection/ProductSection'

const ProductsPage = () => {
	const dispatch = useDispatch()
	const status = useSelector(s => s.products.status)
	const selected = useSelector(s => s.categories.selectedCategory || 'all')

	// твой общий отфильтрованный список по поиску/категории
	const filtered = useSelector(selectFilteredProducts)

	// все акционные (без фильтров)
	const discountedAll = useSelector(selectDiscountedProducts)

	// акционные C учётом текущих фильтров/поиска
	const discountedSet = useMemo(
		() => new Set(discountedAll.map(p => p.id)),
		[discountedAll]
	)
	const discounted = useMemo(
		() => filtered.filter(p => discountedSet.has(p.id)),
		[filtered, discountedSet]
	)

	// чтобы не дублировать — убираем акционные из «обычных»
	const nonDiscounted = useMemo(
		() => filtered.filter(p => !discountedSet.has(p.id)),
		[filtered, discountedSet]
	)

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchProducts())
			dispatch(fetchCategories())
		}
	}, [status, dispatch])

	// формируем секции (если выбрано all — можно показывать обе)
	const sections = useMemo(() => {
		const res = []

		// 1) Акции (если есть хоть один товар со скидкой)
		if (discounted.length > 0) {
			res.push({ title: 'Акции', items: discounted })
		}

		// 2) Остальные — сгруппировать по категории или просто одной секцией,
		//    в зависимости от твоей текущей логики.
		if ((selected || 'all').toLowerCase() !== 'all') {
			// если выбрана конкретная категория/подкатегория — одна секция
			res.push({
				title: selected[0].toUpperCase() + selected.slice(1),
				items: nonDiscounted,
			})
		} else {
			// если "Все" — секции по категориям
			const map = new Map()
			for (const p of nonDiscounted) {
				const key = p.category || 'Без категории'
				if (!map.has(key)) map.set(key, [])
				map.get(key).push(p)
			}
			for (const [title, items] of map) {
				res.push({ title, items })
			}
		}

		return res
	}, [discounted, nonDiscounted, selected])

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
