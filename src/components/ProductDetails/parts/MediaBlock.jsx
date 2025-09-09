// src/components/ProductCart/MediaBlock.jsx
import { memo } from 'react'
import overlaySvg from '../../../assets/SVG/overlay.svg'
import BackButton from '../../ui/BackButton'

const MediaBlock = ({ img, name, onBack }) => {
	return (
		<div className='rounded-[10px] overflow-hidden bg-[#f6f4f2] relative w-[695px] h-[400px]'>
			{/* Назад поверх медиа */}
			<BackButton onClick={onBack} className='absolute cursor-pointer z-10' />

			{img ? (
				<img
					src={img}
					alt={name}
					className='w-full rounded-[12px] h-full object-cover'
				/>
			) : (
				<div className='grid place-items-center w-full h-full opacity-60'>
					Нет изображения
				</div>
			)}

			{/* Оверлей Play — как было */}
			<div className='absolute inset-0 pointer-events-none grid place-items-center'>
				<div className='rounded-[10px] grid place-items-center px-3 py-2'>
					<img src={overlaySvg} alt='overlay' />
				</div>
			</div>
		</div>
	)
}

export default memo(MediaBlock)
