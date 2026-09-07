// src/hooks/useCatalogFilterQuery.js
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchQueryPage,
	hasActiveFilters,
	loadCatalogQuery,
	makeQueryKey,
} from '../store/slices/productsSlice'
import useDebouncedValue from './useDebouncedValue'

const SEARCH_DEBOUNCE_MS = 300

/**
 * Заменяет "докачать весь каталог при выборе категории/поиске/применении
 * фильтров" на server-side фильтрацию: при смене category/search/filters
 * запрашивается только первая страница отфильтрованных сервером
 * результатов, следующие — по onLoadMore. Это единственный путь получения
 * отфильтрованных товаров — модалка "фильтр" (цена/тип/производитель/
 * хлопки/мощность/время/теги) присылает сюда же свой applied-снимок
 * (filtersSlice.selectAppliedFilters), а не фильтрует то, что уже
 * загружено на клиенте.
 *
 * - category — не дебаунсится (клик по категории должен быть мгновенным);
 * - search — дебаунсится на SEARCH_DEBOUNCE_MS, чтобы не слать запрос на
 *   каждую нажатую клавишу;
 * - filters — не дебаунсится: меняется только по явному клику "показать" в
 *   модалке (applyNow), а не на каждое движение чекбокса/слайдера;
 * - смена category/search/filters отменяет предыдущий ещё летящий запрос
 *   (AbortController через thunkAPI.signal) — устаревший ответ не может
 *   затереть более новый (доп. защита — и в самом редьюсере, см.
 *   productsSlice.fetchQueryPage.fulfilled);
 * - active=false полностью выключает хук (например, пока открыта карточка
 *   товара или подкатегория/акции — там своя логика, без серверных
 *   category/search/filters запросов).
 */
export default function useCatalogFilterQuery({ category, search, filters, active = true }) {
	const dispatch = useDispatch()
	const debouncedSearch = useDebouncedValue(String(search || '').trim(), SEARCH_DEBOUNCE_MS)
	const normalizedCategory = category && category !== 'all' ? category : null
	const filtersActive = hasActiveFilters(filters)

	const isFiltering = !!active && (!!normalizedCategory || !!debouncedSearch || filtersActive)

	const queryState = useSelector(s => s.products.query)

	// filters — стабильная ссылка на state.filters.applied (Redux меняет её
	// только когда сам applied реально переприсвоен), так что этот useMemo
	// не пересчитывается на каждый ре-рендер компонента-потребителя.
	const queryKey = useMemo(
		() => makeQueryKey(normalizedCategory, debouncedSearch, filters),
		[normalizedCategory, debouncedSearch, filters]
	)

	useEffect(() => {
		if (!isFiltering) return

		const handle = dispatch(
			loadCatalogQuery({ category: normalizedCategory, search: debouncedSearch, filters })
		)

		// Если до завершения этого запроса category/search/filters снова
		// поменяются (или компонент размонтируется) — React вызовет этот
		// cleanup ДО следующего запуска эффекта, отменяя ещё летящий запрос.
		return () => {
			handle?.abort?.()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFiltering, queryKey, dispatch])

	const isCurrent = queryState.key === queryKey

	const loadMore = useCallback(() => {
		if (!isFiltering || !isCurrent) return
		if (queryState.status === 'loading' || !queryState.hasNext) return
		dispatch(
			fetchQueryPage({
				category: queryState.category,
				search: queryState.search,
				filters: queryState.filters,
				page: queryState.page + 1,
			})
		)
	}, [dispatch, isFiltering, isCurrent, queryState])

	return {
		isFiltering,
		// Пока queryState ещё относится к предыдущей категории/запросу/
		// набору фильтров (запрос только что стартовал, редьюсер ещё не
		// сбросил items) — отдаём пустой список и статус loading, чтобы не
		// мигнуть чужими товарами.
		items: isCurrent ? queryState.items : [],
		status: isCurrent ? queryState.status : 'loading',
		canLoadMore: isCurrent && !!queryState.hasNext,
		loadMore,
	}
}
