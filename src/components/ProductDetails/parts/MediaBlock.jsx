// src/components/ProductDetails/parts/MediaBlock.jsx
import { memo } from 'react'
import overlaySvg from '../../../assets/SVG/overlay.svg'
import BackButton from '../../ui/BackButton'

const MediaBlock = ({ img, video, name, onBack }) => {
	const videoUrl = video?.url

	return (
		<div
			className={[
				'relative bg-[#f6f4f2] rounded-[10px] overflow-hidden',
				// мобильный режим — тянемся на всю ширину
				'max-[680px]:w-full max-[680px]:h-[240px] max-[680px]:min-h-[220px]',
				// десктоп: фикс высота, ширина полностью управляется флексом, без max-w
				'min-[681px]:h-[400px]',
				'min-[681px]:flex-[1_1_0%]', // гибко занимаем всё доступное
				'min-[681px]:min-w-[380px]', // но не уже 380px, чтобы не ломать картинку
				'min-w-0',
				// без видимых скроллбаров
				'[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
			].join(' ')}
		>
			<BackButton onClick={onBack} className='absolute cursor-pointer z-10' />

			{videoUrl ? (
				<video
					key={videoUrl}
					src={videoUrl}
					controls
					playsInline
					className='w-full h-full object-cover rounded-[12px] bg-black outline-none focus:outline-none focus-visible:outline-none'
				>
					Ваш браузер не поддерживает воспроизведение видео.
				</video>
			) : img ? (
				<img
					src={img}
					alt={name}
					className='w-full h-full object-cover rounded-[12px]'
				/>
			) : (
				<div className='grid place-items-center w-full h-full opacity-60'>
					Нет изображения
				</div>
			)}

			{/* декоративная иконка воспроизведения — только пока нет настоящего видео,
			    иначе у видео уже есть свои нативные controls */}
			{!videoUrl && (
				<div className='absolute inset-0 pointer-events-none grid place-items-center'>
					<div className='rounded-[10px] grid place-items-center px-3 py-2 shadow-lg'>
						<img src={overlaySvg} alt='overlay' />
					</div>
				</div>
			)}
		</div>
	)
}

export default memo(MediaBlock)
