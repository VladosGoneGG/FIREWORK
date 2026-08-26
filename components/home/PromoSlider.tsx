'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const SLIDES = ['/promo/tovar-1.webp', '/promo/tovar-2.webp', '/promo/tovar-3.webp']
const INTERVAL_MS = 3500

// Auto-rotating hero carousel — the real original homepage hero (not the
// dead-code PromoMain/bannerMain.svg the audit initially assumed). Client
// component: needs the interval + translateX transform state.
export default function PromoSlider() {
	const [index, setIndex] = useState(0)

	useEffect(() => {
		const id = setInterval(() => setIndex(i => (i + 1) % SLIDES.length), INTERVAL_MS)
		return () => clearInterval(id)
	}, [])

	return (
		<div
			className="relative mx-auto mb-[30px] w-full max-w-[665px] overflow-hidden rounded-[10px] bg-[#f6f4f2]"
			style={{ aspectRatio: '64 / 30' }}
			aria-roledescription="carousel"
		>
			<div
				className="flex h-full transition-transform duration-[380ms] ease-out"
				style={{ transform: `translateX(-${index * 100}%)` }}
			>
				{SLIDES.map((src, i) => (
					<div key={src} className="relative h-full w-full shrink-0">
						<Image
							src={src}
							alt=""
							fill
							sizes="665px"
							className="object-cover"
							priority={i === 0}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
