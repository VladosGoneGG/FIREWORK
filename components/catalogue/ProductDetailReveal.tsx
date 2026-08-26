'use client'

import { motion } from 'motion/react'
import { useSkipEntranceOnce } from './FirstPaintContext'

// Same first-paint-flash guard as ProductGridReveal, shared context: the
// original's ProductDetails view fades in (opacity 0→1, y:16→0, 0.15s
// easeOut) every time it mounts — including a fresh visit, since the
// original is a client-only SPA with no pre-rendered first paint to
// flash against. Skip only this Next.js app's literal first server-
// rendered paint; every click-through from a card plays the same fade.
export default function ProductDetailReveal({ children }: { children: React.ReactNode }) {
	const skipEntrance = useSkipEntranceOnce()

	return (
		<motion.div
			initial={skipEntrance ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ease: 'easeOut', duration: 0.15 }}
		>
			{children}
		</motion.div>
	)
}
