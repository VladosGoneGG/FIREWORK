// src/components/ProductDetails/parts/DescriptionBlock.jsx
import { memo } from 'react'

const DescriptionBlock = ({
	description,
	certificateNumber,
	className = '',
}) => {
	return (
		<div className={['bg-transparent rounded-[12px] p-2', className].join(' ')}>
			{/* ВАЖНО: этот контейнер занимает всю высоту своей строки и скроллится */}
			<div
				className={[
					'w-full max-h-[140px]',
					'overflow-y-auto overscroll-contain touch-pan-y scroll-smooth',
					'scroll-hidden', // твоя утилита скрытия скроллбара
				].join(' ')}
				onWheelCapture={e => e.stopPropagation()}
				onTouchMoveCapture={e => e.stopPropagation()}
			>
				<div className='font-semibold mb-1'>ОПИСАНИЕ:</div>

				<p className='text-[14px] opacity-80'>
					{description || 'Описание товара отсутствует.'}
				</p>

				<div className='font-semibold mb-1 mt-3'>СЕРТИФИКАТ:</div>
				<p className='text-[14px] opacity-80'>
					{certificateNumber && String(certificateNumber).trim()
						? certificateNumber
						: '—'}
				</p>
			</div>
		</div>
	)
}

export default memo(DescriptionBlock)
