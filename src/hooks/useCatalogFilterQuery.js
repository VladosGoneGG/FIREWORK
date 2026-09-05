// src/hooks/useCatalogFilterQuery.js
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchQueryPage, loadCatalogQuery, makeQueryKey } from '../store/slices/productsSlice'
import useDebouncedValue from './useDebouncedValue'

const SEARCH_DEBOUNCE_MS = 300

/**
 * Заменяет "докачать весь каталог при выборе категории/поиске" на server-side
 * фильтрацию: при смене category/search запрашивается только первая
 * страница отфильтрованных сервером результатов, следующие — по onLoadMore.
 *
 * - category — не дебаунсится (клик по категории должен быть мгновенным);
 * - search — дебаунсится на SEARCH_DEBOUNCE_MS, чтобы не слать запрос на
 *   каждую нажатую клавишу;
 * - смена category/search отменяет предыдущий ещё летящий запрос
 *   (AbortController через thunkAPI.signal) — устаревший ответ не может
 *   затереть более новый (доп. защита — и в самом редьюсере, см.
 *   productsSlice.fetchQueryPage.fulfilled);
 * - active=false полностью выключает хук (например, пока открыта карточка
 *   товара или подкатегория/акции — там своя логика, без серверных
 *   category/search запросов).
 */
export default function useCatalogFilterQuery({ category, search, active = true }) {
	const dispatch = useDispatch()
	const debouncedSearch = useDebouncedValue(String(search || '').trim(), SEARCH_DEBOUNCE_MS)
	const normalizedCategory = category && category !== 'all' ? category : null

	const isFiltering = !!active && (!!normalizedCategory || !!debouncedSearch)

	const queryState = useSelector(s => s.products.query)

	useEffect(() => {
		if (!isFiltering) return

		const handle = dispatch(loadCatalogQuery({ category: normalizedCategory, search: debouncedSearch }))

		// Если до завершения этого запроса category/search снова поменяются
		// (или компонент размонтируется) — React вызовет этот cleanup ДО
		// следующего запуска эффекта, отменяя ещё летящий запрос.
		return () => {
			handle?.abort?.()
		}
	}, [isFiltering, normalizedCategory, debouncedSearch, dispatch])

	const isCurrent = queryState.key === makeQueryKey(normalizedCategory, debouncedSearch)

	const loadMore = useCallback(() => {
		if (!isFiltering || !isCurrent) return
		if (queryState.status === 'loading' || !queryState.hasNext) return
		dispatch(
			fetchQueryPage({
				category: queryState.category,
				search: queryState.search,
				page: queryState.page + 1,
			})
		)
	}, [dispatch, isFiltering, isCurrent, queryState])

	return {
		isFiltering,
		// Пока queryState ещё относится к предыдущей категории/запросу
		// (запрос только что стартовал, редьюсер ещё не сбросил items) —
		// отдаём пустой список и статус loading, чтобы не мигнуть чужими
		// товарами.
		items: isCurrent ? queryState.items : [],
		status: isCurrent ? queryState.status : 'loading',
		canLoadMore: isCurrent && !!queryState.hasNext,
		loadMore,
	}
}
