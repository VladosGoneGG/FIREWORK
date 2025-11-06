// src/components/ProductCart/MediaBlock.jsx
import { memo } from 'react'
import overlaySvg from '../../../assets/SVG/overlay.svg'
import BackButton from '../../ui/BackButton'

const MediaBlock = ({ img, name, onBack }) => {
	return (
		<div
			className={[
				'relative bg-[#f6f4f2] rounded-[10px] overflow-hidden',
				// ≤680px: тянется по ширине контейнера, держим аспект 695/400
				'max-[680px]:w-full max-[680px]:aspect-[695/400]',
				// ≥681px: ровно как в исходнике — 695 × 400
				'min-[681px]:w-[695px] min-[681px]:h-[400px]',
				// без видимых скроллбаров (скролл колёсиком остаётся)
				'[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
			].join(' ')}
		>
			<BackButton onClick={onBack} className='absolute cursor-pointer z-10' />

			{img ? (
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

			<div className='absolute inset-0 pointer-events-none grid place-items-center'>
				<div className='rounded-[10px] grid place-items-center px-3 py-2 shadow-lg'>
					<img src={overlaySvg} alt='overlay' />
				</div>
			</div>
		</div>
	)
}

export default memo(MediaBlock)
