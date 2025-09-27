import { memo, useEffect, useRef, useState } from 'react'
const DEFAULT_IMAGES = ['/tovar-1.webp', '/tovar-2.webp', '/tovar-3.webp']

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
		if (!active) return
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
				'relative w-[640px] h-[300px] rounded-[10px] overflow-hidden mx-auto bg-[#f6f4f2] mt-2.5',
				'select-none',
				className,
			].join(' ')}
			aria-label='Промо-слайдер'
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
