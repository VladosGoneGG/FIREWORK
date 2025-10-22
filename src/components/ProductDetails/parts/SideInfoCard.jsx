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
		// ≤680px: строка; ≥681px: колонка как раньше, фикс. ширина 210px
		<aside className='self-stretch inline-flex justify-start items-start gap-2.5 max-[680px]:flex-row min-[681px]:flex-col w-full min-[681px]:w-[210px] flex-shrink-0'>
			{/* превью */}
			<div
				className={[
					// твои исходные стили превью
					'rounded-[12px] overflow-hidden bg-[#f6f4f2] grid place-items-center',
					// ≥681px — как было
					'min-[681px]:w-full min-[681px]:h-[200px]',
					// ≤680px — размеры из фигмы: 192×208, радиус 20, тень как на макете
					'max-[680px]:w-48 max-[680px]:h-52 max-[680px]:rounded-[20px] max-[680px]:shadow-[0_0_10px_rgba(0,0,0,0.25)] max-[680px]:shrink-0',
				].join(' ')}
			>
				{img ? (
					<img src={img} alt={name} className='w-full h-full object-contain' />
				) : (
					<span className='text-xs opacity-60'>Нет фото</span>
				)}
			</div>

			{/* правая часть: характеристики + кнопка */}
			<div
				className={[
					// исходные стили карточки
					'bg-white px-1.5 flex flex-col items-start relative',
					// ≤680px: занимать доступное справа, не ломать перенос; отступ сверху 10px как в примере
					'max-[680px]:flex-1 max-[680px]:min-w-0 max-[680px]:pt-2.5',
				].join(' ')}
			>
				{/* старая цена в углу — как было */}
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
						// было w-[150px]; на мобилке пусть растягивается по доступной ширине
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

				{/* сертификат */}
				<div className='text-[10px] ml-1 mt-[8px] font-baron lowercase flex items-center gap-2'>
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
				<div className='mt-[5px] ml-1 mb-[10px] text-[#098D00] text-[13px] lowercase font-baron leading-[13px] whitespace-nowrap'>
					в наличии <span className='text-[13px]'>{inStock}</span> шт
				</div>

				{/* кнопка — оставляю твою */}
				<div className='w-full'>
					<PriceQtyButton product={product} unitPrice={unitPrice} />
				</div>
			</div>
		</aside>
	)
}

export default memo(SideInfoCard)
