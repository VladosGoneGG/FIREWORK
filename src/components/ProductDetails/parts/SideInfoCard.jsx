import { memo } from 'react'
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
		// certificateNumber — больше НЕ отображаем здесь
		stock,
	} = product

	const inStock = Number.isFinite(stock) ? stock : 15
	const unitPrice = typeof discountPrice === 'number' ? discountPrice : price

	return (
		// ≤680px: строка; ≥681px: колонка (фикс. ширина 210px)
		<aside className='self-stretch inline-flex justify-start items-start gap-2.5 max-[680px]:flex-row min-[681px]:flex-col w-full min-[681px]:w-[210px] flex-shrink-0'>
			{/* превью */}
			<div
				className={[
					'rounded-[12px] overflow-hidden bg-[#f6f4f2] grid place-items-center',
					'min-[681px]:w-full min-[681px]:h-[200px]',
					'max-[680px]:w-48 max-[680px]:h-52 max-[680px]:rounded-[20px] max-[680px]:shadow-[0_0_10px_rgba(0,0,0,0.25)] max-[680px]:shrink-0',
				].join(' ')}
			>
				{img ? (
					<img src={img} alt={name} className='w-full h-full object-contain' />
				) : (
					<span className='text-xs opacity-60'>Нет фото</span>
				)}
			</div>

			{/* правая часть */}
			<div
				className={[
					'bg-white px-1.5 flex flex-col items-start relative',
					'max-[680px]:flex-1 max-[680px]:min-w-0 max-[680px]:pt-2.5',
				].join(' ')}
			>
				{typeof discountPrice === 'number' && typeof price === 'number' && (
					<div
						className='absolute top-[1px] right-1 px-2 py-1 line-through decoration-1 text-[#BD52E9] pointer-events-none font-baron lowercase'
						title='Старая цена'
					>
						{fmtNum(price)}
					</div>
				)}

				<h3
					className={[
						'font-baron leading-tight truncate text-[18px] line-clamp-2',
						'min-[681px]:w-[150px] max-[680px]:w-auto',
					].join(' ')}
					title={name}
				>
					{name}
				</h3>

				<div className='mt-[5px] text-[10px] text-[#625a51] font-baron uppercase'>
					<span className='lowercase'>производитель:</span>{' '}
					{manufacturer || '—'}
				</div>

				{/* параметры */}
				<div className='ml-1 mt-2.5 grid font-baron grid-cols-2 gap-x-4 gap-y-3 text-[12px]'>
					<Param icon={shotsImg}>{shots ?? '—'}</Param>
					<Param icon={caliberImg}>{caliber ?? '—'}</Param>
					<Param icon={timeImg} title={fmtSecFull(durationSec)}>
						{fmtSecCompact(durationSec)}
					</Param>
					<Param icon={effectsImg}>{effectsCount ?? '—'}</Param>
				</div>

				{/* наличие */}
				<div className='mt-[15px] ml-1  mb-[12px] text-[#098D00] text-[13px] lowercase font-baron leading-[13px] whitespace-nowrap'>
					в наличии <span className='text-[13px]'>{inStock}</span> шт
				</div>

				<div className='w-full'>
					<PriceQtyButton product={product} unitPrice={unitPrice} />
				</div>
			</div>
		</aside>
	)
}

export default memo(SideInfoCard)
