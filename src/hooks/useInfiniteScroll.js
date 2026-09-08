// src/hooks/useInfiniteScroll.js
import { useEffect, useRef } from 'react'

const NEAR_VIEWPORT_PX = 200 // подгружаем чуть заранее, не дожидаясь упора в самый низ

// Возвращает ref для "сторожевого" элемента: как только он показывается
// в зоне видимости (скролл вниз), вызывает onLoadMore — классический
// infinite scroll без кнопки и без номеров страниц.
//
// Пересоздаём IntersectionObserver при каждом изменении deps (обычно —
// количество товаров): наблюдатель шлёт начальное уведомление сразу при
// observe(), поэтому если сторожевой элемент всё ещё виден после подгрузки
// (короткая страница не вытолкнула его вниз) — это корректно ловится без
// самодельных измерений через window.innerHeight, которые игнорировали
// обрезку скролл-контейнера и вызывали onLoadMore независимо от реальной
// прокрутки — отсюда и «прыжки»/дрожание контента у нижнего края списка.
export default function useInfiniteScroll(onLoadMore, { enabled = true, deps = [] } = {}) {
	const sentinelRef = useRef(null)

	useEffect(() => {
		if (!enabled) return
		const node = sentinelRef.current
		if (!node) return

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0]?.isIntersecting) onLoadMore()
			},
			{ rootMargin: `${NEAR_VIEWPORT_PX}px` }
		)

		observer.observe(node)
		return () => observer.disconnect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled, onLoadMore, ...deps])

	return sentinelRef
}
