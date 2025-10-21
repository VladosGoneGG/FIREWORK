import { useEffect, useSyncExternalStore } from 'react'

function subscribe(callback) {
	const handler = () => callback()
	window.addEventListener('resize', handler)
	return () => window.removeEventListener('resize', handler)
}

function getSnapshot(query) {
	return () => window.matchMedia(query).matches
}

function getServerSnapshot() {
	return () => false
}

/**
 * Пример: useMediaQuery('(max-width: 1040px)')
 */
export default function useMediaQuery(query) {
	const matches = useSyncExternalStore(
		subscribe,
		getSnapshot(query),
		getServerSnapshot
	)

	// Первичный запуск чтобы учесть текущее состояние (на случай, если resize ещё не случался)
	useEffect(() => {}, [matches])

	return matches
}
