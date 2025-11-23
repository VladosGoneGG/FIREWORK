// src/utils/useStickToBottom.js
import { useEffect, useRef, useState } from 'react'

/**
 * baseHeight — базовая высота (824 / 834)
 * bottomOffset — минимальный отступ от низа окна (px)
 *
 * Возвращает:
 *  - ref — вешаешь на контейнер
 *  - height — подставляешь в style.height
 *
 * Логика:
 *  - при маленьком экране: высота = baseHeight
 *  - при большом экране: растягиваем блок вниз так,
 *    чтобы низ был не ближе, чем bottomOffset к нижней границе окна.
 */
export default function useStickToBottom(baseHeight, bottomOffset = 10) {
	const ref = useRef(null)
	const [height, setHeight] = useState(baseHeight)

	useEffect(() => {
		function recompute() {
			const el = ref.current
			if (!el) {
				setHeight(baseHeight)
				return
			}

			const rect = el.getBoundingClientRect()
			const viewportH =
				window.innerHeight || document.documentElement.clientHeight

			// сколько места есть от верха блока до низа окна с нужным отступом
			const available = viewportH - bottomOffset - rect.top

			// не даём блоку стать меньше baseHeight
			const next = Math.max(baseHeight, available)

			setHeight(next)
		}

		// первый расчёт
		recompute()

		// пересчитываем на ресайзах
		window.addEventListener('resize', recompute)
		window.addEventListener('orientationchange', recompute)

		return () => {
			window.removeEventListener('resize', recompute)
			window.removeEventListener('orientationchange', recompute)
		}
	}, [baseHeight, bottomOffset])

	return { ref, height }
}
