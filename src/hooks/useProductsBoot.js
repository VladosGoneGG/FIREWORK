// src/hooks/useProductsBoot.js
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../store/slices/categoriesSlice'
import { fetchProductsPage } from '../store/slices/productsSlice'

export default function useProductsBoot() {
	const dispatch = useDispatch()
	const productsStatus = useSelector(s => s.products.status)
	const categoriesStatus = useSelector(s => s.categories.status)

	useEffect(() => {
		if (productsStatus === 'idle') dispatch(fetchProductsPage({ page: 1 }))
	}, [productsStatus, dispatch])

	useEffect(() => {
		if (categoriesStatus === 'idle') dispatch(fetchCategories())
	}, [categoriesStatus, dispatch])
}
