// src/components/PromoSlider/PromoSlider.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'

// base берём из Vite (подставится из vite.config base)
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/')
const withBase = p => `${BASE}${String(p).replace(/^\.?\/*/, '')}` // 'promo/x.webp' -> '/REPO/promo/x.webp'
const isExternal = s => /^https?:|^data:|^blob:/.test(s)
const norm = s => (isExternal(s) ? s : withBase(s.replace(/^\.\//, '')))

// дефолтные картинки теперь из public/promo/*
const DEFAULT_IMAGES = [
	'promo/tovar-1.webp',
	'promo/tovar-2.webp',
	'promo/tovar-3.webp',
]

const PromoSlider = ({
	images = DEFAULT_IMAGES,
	intervalMs = 3500,
	fit = 'cover',
	className = '',
	active = true,
}) => {
	const [i, setI] = useState(0)
	const timerRef = useRef(null)

	// нормализуем любые входные пути под BASE (и локально, и на GH Pages)
	const imgs = useMemo(() => images.map(norm), [images])

	useEffect(() => {
		if (!active || imgs.length <= 1) return
		timerRef.current = setInterval(
			() => setI(prev => (prev + 1) % imgs.length),
			intervalMs
		)
		return () => clearInterval(timerRef.current)
	}, [active, imgs.length, intervalMs])

	const fitClass =
		fit === 'cover'
			? 'object-cover object-center'
			: 'object-contain object-center bg-[#f6f4f2]'

	return (
		<div
			className={[
				'relative w-full max-w-[665px] mx-auto rounded-[10px] overflow-hidden bg-[#f6f4f2] mb-[30px]',
				'px-0',
				'select-none',
				className,
			].join(' ')}
			aria-label='Промо-слайдер'
			style={{ aspectRatio: '64 / 30' }}
		>
			<div
				className='absolute inset-0 flex'
				style={{
					width: `${imgs.length * 100}%`,
					transform: `translateX(-${i * (100 / imgs.length)}%)`,
					transition: 'transform 380ms ease-out',
					willChange: 'transform',
				}}
			>
				{imgs.map((src, idx) => (
					<div
						key={idx}
						className='flex-shrink-0'
						style={{ width: `${100 / imgs.length}%`, height: '100%' }}
					>
						<img
							src={src}
							alt=''
							draggable={false}
							className={[
								'block w-full h-full pointer-events-none',
								fitClass,
							].join(' ')}
							style={{
								width: '100%',
								height: '100%',
								objectFit: fit,
								objectPosition: 'center',
							}}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

export default memo(PromoSlider)
