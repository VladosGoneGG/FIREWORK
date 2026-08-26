'use client'

import { motion } from 'motion/react'
import { useSkipEntranceOnce } from './FirstPaintContext'

// Client wrapper around the server-rendered grid: motion needs a client
// boundary, but the <ProductCard>s passed in as children stay server
// components — the variants apply to this wrapper's own mount, not to
// each card individually. Keyed by the caller on `title` so it replays
// whenever the section's contents change (filter/sort).
export default function ProductGridReveal({ children }: { children: React.ReactNode }) {
	const skipEntrance = useSkipEntranceOnce()

	return (
		<motion.div
			initial={skipEntrance ? false : 'hidden'}
			animate="show"
			variants={{
				hidden: { opacity: 0, y: 14 },
				show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.15 } },
			}}
			className="flex flex-wrap items-start gap-2.5"
		>
			{children}
		</motion.div>
	)
}
