import { useEffect, useState } from 'react'
import { getCatalogPage } from '../../../api/productsApi'
import useDebouncedValue from '../../../hooks/useDebouncedValue'

const DEBOUNCE_MS = 300

// Точное количество товаров, которые вернёт "показать" с ТЕКУЩИМ (ещё не
// применённым) черновиком формы — реальный запрос на сервер (limit=1, из
// ответа нужен только pagination.totalItems), с учётом текущей категории/
// поиска — та же серверная фильтрация, что и у настоящих результатов (см.
// useCatalogFilterQuery), просто без выборки самих товаров.
//
// active=false (панель фильтров закрыта/ещё не открывалась) полностью
// выключает хук — иначе он слал бы запрос при каждом маунте
// SubcategoryOverlay, даже если пользователь ни разу не открывал фильтры.
export default function useFilterPreviewCount({ category, search, filters, active }) {
	const normalizedCategory = category && category !== 'all' ? category : null
	const normalizedSearch = String(search || '').trim()

	// Сериализуем в строку — стабильный ключ для дебаунса и зависимостей
	// эффекта, независимо от того, что filters/form пересоздаются новым
	// объектом на каждый рендер.
	const queryKey = JSON.stringify({ normalizedCategory, normalizedSearch, filters })
	const debouncedKey = useDebouncedValue(queryKey, DEBOUNCE_MS)

	const [count, setCount] = useState(null)
	const [status, setStatus] = useState('idle')

	useEffect(() => {
		if (!active) return

		const { normalizedCategory: c, normalizedSearch: s, filters: f } = JSON.parse(debouncedKey)
		const controller = new AbortController()

		setStatus('loading')
		getCatalogPage({
			page: 1,
			limit: 1,
			category: c,
			search: s,
			filters: f,
			signal: controller.signal,
		})
			.then(data => {
				setCount(data?.pagination?.totalItems ?? 0)
				setStatus('succeeded')
			})
			.catch(err => {
				if (controller.signal.aborted) return
				// Не блокирует применение фильтров — просто оставляем последнее
				// известное значение (или null при самой первой попытке).
				setStatus('failed')
			})

		return () => controller.abort()
	}, [debouncedKey, active])

	return { count, status }
}
