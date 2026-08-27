import { useEffect, useRef } from 'react'

// Module-level stack shared by every overlay so only the topmost (most
// recently opened) one reacts to Escape, and the app has exactly one
// keydown listener regardless of how many overlays are mounted.
const stack = []

function remove(ref) {
	const index = stack.indexOf(ref)
	if (index !== -1) stack.splice(index, 1)
	if (stack.length === 0) window.removeEventListener('keydown', handleKeydown)
}

function handleKeydown(e) {
	if (e.key !== 'Escape') return
	const top = stack[stack.length - 1]
	if (!top) return
	// Pop immediately: some overlays (e.g. nested inside an AnimatePresence-
	// gated wrapper) keep their `active` prop frozen at its last value until
	// their exit animation finishes, so waiting for the effect cleanup below
	// to remove them would let a second, rapid Escape hit the same stale
	// entry instead of the next layer down.
	remove(top)
	top.current?.()
}

export default function useEscapeToClose(active, onClose) {
	const onCloseRef = useRef(onClose)
	onCloseRef.current = onClose

	useEffect(() => {
		if (!active) return

		stack.push(onCloseRef)
		if (stack.length === 1) window.addEventListener('keydown', handleKeydown)

		return () => remove(onCloseRef)
	}, [active])
}
