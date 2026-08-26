'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'

// A UI-deceleration curve (quick start, smooth settle) — not the original's
// 'easeOut' string. Deliberate departure from strict numerical parity with
// ProductPage.jsx's BLOCK (0.12s/0.15s, 'easeOut'): that timing is correct
// on paper, but Next.js's client-side navigation adds a real ~85ms gap
// between click and the route actually changing (an async RSC round-trip,
// vs. the original's synchronous Redux dispatch with zero gap) — measured
// directly via onAnimationStart timestamps against a production build.
// Reproducing the original's numbers exactly, on top of that gap, read as
// an abrupt snap rather than a polished handoff. These values tune for the
// actual felt result in a real browser instead.
const EASE = [0.22, 1, 0.36, 1] as const

// Route-level crossfade for the *center content only* — mounted by the
// persistent CatalogueShell (rendered once from app/layout.tsx) around its
// scrollable card's {children}, mirroring exactly where the original's
// AnimatePresence/BLOCK lives inside ProductsPage.jsx: never wrapping the
// sidebar or cart columns, which are CatalogueShell's separate, non-
// animated siblings. A persistent host is required at all — page.tsx
// output (including a per-page shell) is torn down instantly on route
// change, giving an AnimatePresence nested inside it no chance to run its
// exit animation.
//
// Keyed on pathname only, not search params: sort/filter/search stay within
// a route and are already covered by the per-section ProductGridReveal/
// ProductDetailReveal enter animations (untouched) — and useSearchParams()
// here would risk de-opting every route from static generation, since
// CatalogueShell wraps every page via the root layout.
export default function PageTransition({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={pathname}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0, transition: { ease: EASE, duration: 0.28 } }}
				exit={{ opacity: 0, y: -6, transition: { ease: EASE, duration: 0.18 } }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}
