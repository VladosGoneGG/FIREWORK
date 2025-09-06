// src/components/ProductDetails/ProductDetails.jsx
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Param from '../Param/Param'
import PriceQtyButton from '../PriceQtyButton/PriceQtyButton'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

// Иконки параметров
import caliberImg from '../../assets/SVG/radius.svg'
import shotsImg from '../../assets/SVG/rocket.svg'
import effectsImg from '../../assets/SVG/star.svg'
import timeImg from '../../assets/SVG/time.svg'

// Иконка скачивания сертификата (React-компонент с SVG)
import DownlSvg from '../DownlSvg/DownlSvg' // скорректируй путь, если другой

const fmtNum = n => new Intl.NumberFormat('ru-RU').format(n)
const fmtPrice = n => (typeof n === 'number' ? fmtNum(n) + ' ₽' : '—')

const fmtSecFull = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}м ${s % 60}с`
			: `${s}с`
		: '—'

const renderSec = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
			: `${s}с`
		: '—'

const ProductDetails = ({ product, related = [], onBack }) => {
	const dispatch = useDispatch()
	const [qty, setQty] = useState(1)

	if (!product) return null

	const {
		name,
		manufacturer,
		images = [],
		description,
		shots,
		caliber,
		durationSec,
		effectsCount,
		price,
		discountPrice,
		certificateUrl, // <— ссылка на файл сертификата
		stock,
	} = product

	const img = images[0]
	const inStock = Number.isFinite(stock) ? stock : 15

	return (
		<section
			className='
        bg-white rounded-[20px] w-[925px] h-[834px]
        overflow-hidden flex flex-col
      '
		>
			{/* Внутренняя обёртка с паддингом */}
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* Основной ряд: слева медиа, справа узкая колонка */}
				<div className='flex items-start gap-2.5'>
					{/* Медиа слева (строго 695×400) */}
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
							<img
								src={img}
								alt={name}
								className='w-full h-full object-cover'
							/>
						) : (
							<div className='grid place-items-center w-full h-full opacity-60'>
								Нет изображения
							</div>
						)}

						{/* Оверлей Play (если нужен — оставь; если нет — удали блок ниже) */}
						<div className='absolute inset-0 pointer-events-none grid place-items-center'>
							<div className='rounded-[10px] bg-black/10 backdrop-blur-[2px] grid place-items-center px-3 py-2'>
								<div className='w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1' />
							</div>
						</div>
					</div>

					{/* Правая узкая колонка */}
					<aside className='w-[210px] flex-shrink-0'>
						{/* Картинка товара (узкая, не кропим) */}
						<div className='w-full h-[200px] rounded-[12px] overflow-hidden bg-[#f6f4f2] grid place-items-center'>
							{img ? (
								<img
									src={img}
									alt={name}
									className='w-full h-full object-contain'
								/>
							) : (
								<span className='text-xs opacity-60'>Нет фото</span>
							)}
						</div>

						{/* Инфоблок под картинкой — позиционируем relative, чтобы положить старую цену в угол */}
						<div className='bg-white p-1.5 flex flex-col items-start relative'>
							{/* Старая цена (зачёркнутая) в правом верхнем углу */}
							{typeof discountPrice === 'number' &&
								typeof price === 'number' && (
									<div
										className='absolute top-[1px] right-1
                    px-2 py-1 line-through decoration-1 text-[#BD52E9]
                    pointer-events-none font-baron lowercase'
										title='Старая цена'
									>
										{fmtNum(price)}{' '}
									</div>
								)}

							{/* Имя и производитель */}
							<h3 className='font-baron leading-tight line-clamp-2'>{name}</h3>
							<div className='ml-0.5 text-[10px] text-[#625a51] font-baron uppercase'>
								<span className='lowercase'>производитель:</span>{' '}
								{manufacturer || '—'}
							</div>

							{/* Параметры */}
							<div className='mt-2 ml-1 grid font-baron grid-cols-2 gap-x-4 gap-y-3 text-[12px]'>
								<Param icon={shotsImg}>{shots ?? '—'}</Param>
								<Param icon={caliberImg}>{caliber ?? '—'}</Param>
								<Param icon={timeImg} title={fmtSecFull(durationSec)}>
									{renderSec(durationSec)}
								</Param>
								<Param icon={effectsImg}>{effectsCount ?? '—'}</Param>
							</div>

							{/* Сертификат — SVG с download */}
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

							{/* Наличие */}
							<div className='mt-2 ml-0.5 text-[#28a745] text-[7px] lowercase font-baron'>
								в наличии <span className='text-[10px]'>{inStock}</span> шт
							</div>

							<div className='mt-3 w-full'>
								<PriceQtyButton
									product={product}
									unitPrice={
										typeof discountPrice === 'number' ? discountPrice : price
									}
								/>
							</div>
						</div>
					</aside>
				</div>

				{/* Описание (скролл) */}
				<div className='bg-transparent rounded-[12px] p-2 min-h-[120px] max-h-[220px] overflow-y-auto'>
					<div className='font-semibold mb-1'>ОПИСАНИЕ:</div>
					<p className='text-[14px] opacity-80'>
						{description || 'Описание товара отсутствует.'}
					</p>
				</div>

				{/* Добавь в набор */}
				{related?.length > 0 && (
					<>
						<div className='flex items-center justify-between'>
							<div className='font-semibold'>ДОБАВЬ В НАБОР</div>
							<button className='text-[12px] opacity-70 hover:opacity-100'>
								Посмотреть ещё
							</button>
						</div>
						<div className='grid grid-cols-5 gap-3 overflow-y-auto'>
							{related.slice(0, 5).map(p => (
								<ProductCardMini key={p.id} product={p} onSelect={() => {}} />
							))}
						</div>
					</>
				)}
			</div>
		</section>
	)
}

export default ProductDetails
