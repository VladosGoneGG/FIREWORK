// src/components/ProductDetails/parts/SideInfoCard.jsx
import { memo } from 'react'
import DownlSvg from '../../DownlSvg/DownlSvg'
import Param from '../../Param/Param'
import PriceQtyButton from '../../PriceQtyButton/PriceQtyButton'

import caliberImg from '../../../assets/SVG/radius.svg'
import shotsImg from '../../../assets/SVG/rocket.svg'
import effectsImg from '../../../assets/SVG/star.svg'
import timeImg from '../../../assets/SVG/time.svg'

import { fmtNum, fmtSecCompact, fmtSecFull } from '../../../utils/format'

function SideInfoCard({ product, img }) {
	const {
		name,
		manufacturer,
		shots,
		caliber,
		durationSec,
		effectsCount,
		price,
		discountPrice,
		certificateUrl,
		stock,
	} = product

	const inStock = Number.isFinite(stock) ? stock : 15
	const unitPrice = typeof discountPrice === 'number' ? discountPrice : price

	return (
		<aside className='w-[210px] flex-shrink-0'>
			{/* превью */}
			<div className='w-full h-[200px] rounded-[12px] overflow-hidden bg-[#f6f4f2] grid place-items-center'>
				{img ? (
					<img src={img} alt={name} className='w-full h-full object-contain' />
				) : (
					<span className='text-xs opacity-60'>Нет фото</span>
				)}
			</div>

			{/* карточка */}
			<div className='bg-white p-1.5 flex flex-col items-start relative'>
				{/* старая цена в углу */}
				{typeof discountPrice === 'number' && typeof price === 'number' && (
					<div
						className='absolute top-[1px] right-1 px-2 py-1 line-through decoration-1 text-[#BD52E9] pointer-events-none font-baron lowercase'
						title='Старая цена'
					>
						{fmtNum(price)}
					</div>
				)}

				<h3
					className='font-baron leading-tight truncate w-[150px] line-clamp-2 '
					title={name}
				>
					{name}
				</h3>
				<div className='ml-0.5 text-[10px] text-[#625a51] font-baron uppercase'>
					<span className='lowercase'>производитель:</span>{' '}
					{manufacturer || '—'}
				</div>

				{/* параметры */}
				<div className='mt-2 ml-1 grid font-baron grid-cols-2 gap-x-4 gap-y-3 text-[12px]'>
					<Param icon={shotsImg}>{shots ?? '—'}</Param>
					<Param icon={caliberImg}>{caliber ?? '—'}</Param>
					<Param icon={timeImg} title={fmtSecFull(durationSec)}>
						{fmtSecCompact(durationSec)}
					</Param>
					<Param icon={effectsImg}>{effectsCount ?? '—'}</Param>
				</div>

				{/* сертификат */}
				<div className='mt-2 text-[10px] font-baron lowercase flex items-center gap-2'>
					<span className='text-[#625a51]'>сертификат</span>
					{certificateUrl ? (
						<a
							href={certificateUrl}
							download
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center pt-1 text-[#625a51] hover:text-firework-red transition'
							title='Скачать сертификат'
						>
							<DownlSvg className='w-4 h-4' />
							<span className='sr-only'>Скачать сертификат</span>
						</a>
					) : (
						<span className='opacity-80'>—</span>
					)}
				</div>

				{/* наличие */}
				<div className='mt-2 ml-0.5 text-[#28a745] text-[7px] lowercase font-baron'>
					в наличии <span className='text-[10px]'>{inStock}</span> шт
				</div>

				{/* кнопка */}
				<div className='mt-3 w-full'>
					<PriceQtyButton product={product} unitPrice={unitPrice} />
				</div>
			</div>
		</aside>
	)
}

export default memo(SideInfoCard)
