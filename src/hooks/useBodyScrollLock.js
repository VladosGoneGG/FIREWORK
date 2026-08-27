import { useEffect } from 'react'

// Module-level counter so nested/sibling overlays (burger menu + cart sheet,
// etc.) share one lock: the body only unlocks once every locker has released it.
let lockCount = 0
let previousOverflow = ''

export default function useBodyScrollLock(active) {
	useEffect(() => {
		if (!active) return

		if (lockCount === 0) previousOverflow = document.body.style.overflow
		lockCount += 1
		document.body.style.overflow = 'hidden'

		return () => {
			lockCount -= 1
			if (lockCount === 0) document.body.style.overflow = previousOverflow
		}
	}, [active])
}
