'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Tracks whether the app has committed its first paint yet in this
// browser tab. Always starts `true` on both server and client, so unlike
// a module-level `let` flag (the bug this replaces: it's shared mutable
// state across concurrent SSR requests on the same Node process, and
// React's dev-mode double-render), it never disagrees between server and
// client and can't produce a hydration mismatch.
const FirstPaintContext = createContext(true)

export function FirstPaintProvider({ children }: { children: React.ReactNode }) {
	const [isFirstPaint, setIsFirstPaint] = useState(true)
	useEffect(() => {
		// Signals "the first paint has been committed" — not derivable during
		// render, same class of one-time hydration flag as CartProvider's
		// `hydrated` state.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsFirstPaint(false)
	}, [])
	return <FirstPaintContext.Provider value={isFirstPaint}>{children}</FirstPaintContext.Provider>
}

// Entrance-animated components call this once on mount to decide whether
// to skip their own "hidden → show" animation: true only while still
// part of the very first paint (SSR markup is already visible, so
// animating from hidden would flash it invisible first) — which, unlike
// the old flag, correctly covers every section mounted in that same
// first batch, not just the first one. Every component mounted after the
// first paint's effect has fired — later sections in a longer first
// render, and every subsequent client-side navigation — plays the
// entrance normally. `useState`'s initial argument is only read on this
// component's own first render, so a later context flip doesn't change
// an already-mounted component's answer.
export function useSkipEntranceOnce() {
	const isFirstPaint = useContext(FirstPaintContext)
	const [skip] = useState(isFirstPaint)
	return skip
}
