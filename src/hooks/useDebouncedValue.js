// src/hooks/useDebouncedValue.js
import { useEffect, useState } from 'react'

// Возвращает value, но обновлённое не раньше чем через delayMs после
// последнего изменения — стандартный debounce для текстового поиска.
export default function useDebouncedValue(value, delayMs) {
	const [debounced, setDebounced] = useState(value)

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs)
		return () => clearTimeout(id)
	}, [value, delayMs])

	return debounced
}
