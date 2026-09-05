// src/hooks/useInfiniteScroll.js
import { useEffect, useRef } from 'react'

const NEAR_VIEWPORT_PX = 200 // подгружаем чуть заранее, не дожидаясь упора в самый низ

// Возвращает ref для "сторожевого" элемента: как только он показывается
// в зоне видимости (скролл вниз), вызывает onLoadMore — классический
// infinite scroll без кнопки и без номеров страниц.
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
	}, [enabled, onLoadMore])

	// Если после подгрузки сторожевой элемент всё ещё виден (короткая страница
	// не вытолкнула его вниз) — IntersectionObserver повторно не сработает,
	// т.к. состояние пересечения не изменилось. Дожидаемся кадра отрисовки
	// и измеряем позицию заново напрямую — без доверия к «протухшему» флагу.
	useEffect(() => {
		if (!enabled) return
		const node = sentinelRef.current
		if (!node) return

		const id = requestAnimationFrame(() => {
			const rect = node.getBoundingClientRect()
			const nearViewport = rect.top < window.innerHeight + NEAR_VIEWPORT_PX
			if (nearViewport) onLoadMore()
		})
		return () => cancelAnimationFrame(id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)

	return sentinelRef
}
