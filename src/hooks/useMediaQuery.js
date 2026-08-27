import { useEffect, useState } from 'react'

/**
 * Пример: useMediaQuery('(max-width: 1040px)')
 */
export default function useMediaQuery(query) {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

	useEffect(() => {
		const mql = window.matchMedia(query)
		const handler = () => setMatches(mql.matches)
		handler()
		mql.addEventListener('change', handler)
		window.addEventListener('resize', handler)
		return () => {
			mql.removeEventListener('change', handler)
			window.removeEventListener('resize', handler)
		}
	}, [query])

	return matches
}
