// src/components/PromoSlider/PromoSlider.jsx
import { memo, useEffect, useRef, useState } from 'react'
const DEFAULT_IMAGES = ['./tovar-1.webp', './tovar-2.webp', './tovar-3.webp']

const PromoSlider = ({
	images = DEFAULT_IMAGES,
	intervalMs = 3500,
	fit = 'cover',
	className = '',
	active = true,
}) => {
	const [i, setI] = useState(0)
	const timerRef = useRef(null)

	useEffect(() => {
		if (!active || images.length <= 1) return
		timerRef.current = setInterval(
			() => setI(prev => (prev + 1) % images.length),
			intervalMs
		)
		return () => clearInterval(timerRef.current)
	}, [active, images.length, intervalMs])

	const fitClass =
		fit === 'cover'
			? 'object-cover object-center'
			: 'object-contain object-center bg-[#f6f4f2]'

	return (
		<div
			className={[
				// РЕЗИНА: растягиваемся по центру, но не больше макета
				'relative w-full max-w-[665px] mx-auto rounded-[10px] overflow-hidden bg-[#f6f4f2] mt-2.5',
				// немного воздуха по краям на узких, на xl убираем (если нужно — можно убрать)
				'px-0',
				'select-none',
				className,
			].join(' ')}
			aria-label='Промо-слайдер'
			// высота считается автоматически по соотношению сторон 640×300 (≈ 64/30)
			style={{ aspectRatio: '64 / 30' }}
		>
			<div
				className='absolute inset-0 flex'
				style={{
					width: `${images.length * 100}%`,
					transform: `translateX(-${i * (100 / images.length)}%)`,
					transition: 'transform 380ms ease-out',
					willChange: 'transform',
				}}
			>
				{images.map((src, idx) => (
					<div
						key={idx}
						className='flex-shrink-0'
						style={{ width: `${100 / images.length}%`, height: '100%' }}
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
