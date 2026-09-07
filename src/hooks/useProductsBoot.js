// src/hooks/useProductsBoot.js
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../store/slices/categoriesSlice'
import { fetchCatalogFacets, fetchProductsPage } from '../store/slices/productsSlice'

export default function useProductsBoot() {
	const dispatch = useDispatch()
	const productsStatus = useSelector(s => s.products.status)
	const categoriesStatus = useSelector(s => s.categories.status)
	const facetsStatus = useSelector(s => s.products.facets.status)

	useEffect(() => {
		if (productsStatus === 'idle') dispatch(fetchProductsPage({ page: 1 }))
	}, [productsStatus, dispatch])

	useEffect(() => {
		if (categoriesStatus === 'idle') dispatch(fetchCategories())
	}, [categoriesStatus, dispatch])

	// Каталожные значения фильтров — один раз за сессию, независимо от того,
	// сколько страниц каталога уже подгружено (см. useFilterOptions).
	useEffect(() => {
		if (facetsStatus === 'idle') dispatch(fetchCatalogFacets())
	}, [facetsStatus, dispatch])
}
