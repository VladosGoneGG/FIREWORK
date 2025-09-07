import { memo } from 'react'

const MediaBlock = ({ img, name, onBack }) => {
	return (
		<div className='rounded-[10px] overflow-hidden bg-[#f6f4f2] relative w-[695px] h-[400px]'>
			{/* Назад поверх медиа */}
			<button
				onClick={onBack}
				className='
          absolute left-2 top-2 z-10
          text-[12px] px-2 py-1 rounded-[8px]
          bg-white/80 hover:bg-white
          shadow-[0_0_10px_rgba(0,0,0,0.15)]
          backdrop-blur-[2px]
        '
				aria-label='Назад'
				title='Назад'
			>
				← Назад
			</button>

			{img ? (
				<img src={img} alt={name} className='w-full h-full object-cover' />
			) : (
				<div className='grid place-items-center w-full h-full opacity-60'>
					Нет изображения
				</div>
			)}

			{/* Оверлей Play — оставил как декор, можно убрать */}
			<div className='absolute inset-0 pointer-events-none grid place-items-center'>
				<div className='rounded-[10px] bg-black/10 backdrop-blur-[2px] grid place-items-center px-3 py-2'>
					<div className='w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1' />
				</div>
			</div>
		</div>
	)
}

export default memo(MediaBlock)
