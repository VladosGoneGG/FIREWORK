// src/components/ProductDetails/ProductDetails.jsx
import { useDispatch } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice'
import Param from '../Param/Param'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

import caliberImg from '../../assets/SVG/radius.svg'
import shotsImg from '../../assets/SVG/rocket.svg'
import effectsImg from '../../assets/SVG/star.svg'
import timeImg from '../../assets/SVG/time.svg'

const fmtSec = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}м ${s % 60}с`
			: `${s}с.`
		: '—'

const renderSec = s => {
	if (typeof s !== 'number') return '—'

	if (s >= 60) {
		const m = Math.floor(s / 60)
		const sec = s % 60
		return (
			<>
				{m}
				<span className='text-[8px]'>м</span> {sec}
				<span className='text-[8px]'>с.</span>
			</>
		)
	}

	return (
		<>
			{s}
			<span className='text-[8px]'>с.</span>
		</>
	)
}

const fmtPrice = n =>
	typeof n === 'number' ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'

const ProductDetails = ({ product, related = [], onBack }) => {
	const dispatch = useDispatch()
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
		certificate,
		stock,
	} = product

	const img = images[0]
	const inStock = Number.isFinite(stock) ? stock : 15

	return (
		<section
			className='
        bg-white rounded-[20px] w-[925px] h-[834px]
        overflow-hidden
        flex flex-col
      '
		>
			{/* ВНУТРЕННЯЯ ОБЁРТКА С ПАДДИНГОМ */}
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* Основной ряд: слева медиа, справа узкая колонка */}
				<div className='flex items-start gap-2.5'>
					{/* Медиа слева (строго 695×400) */}
					<div className='rounded-[10px] overflow-hidden bg-[#f6f4f2] relative w-[695px] h-[400px]'>
						{/* Кнопка Назад поверх медиа, слева сверху */}
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

						{/* Оверлей Play (по желанию) */}
						<div className='absolute inset-0 pointer-events-none grid place-items-center'>
							<div className='rounded-[10px] bg-black/10 backdrop-blur-[2px] grid place-items-center px-3 py-2'>
								<div className='w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1' />
							</div>
						</div>
					</div>

					{/* Правая узкая колонка (фиксированная ширина) */}
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

						{/* Инфоблок под картинкой */}
						<div className='mt-3 bg-white p-3 flex flex-col items-start '>
							<h3 className='font-baron leading-tight line-clamp-2'>{name}</h3>
							<div className='text-[10px] text-[#625a51] font-baron uppercase'>
								<span className='lowercase'>производитель:</span>{' '}
								{manufacturer || '—'}
							</div>

							<div className='mt-2 grid font-baron  grid-cols-2 gap-2 text-[12px]'>
								<Param icon={shotsImg}>{shots ?? '—'}</Param>
								<Param icon={caliberImg}>{caliber ?? '—'}</Param>
								<Param icon={timeImg} title={fmtSec(durationSec)}>
									{renderSec(durationSec)}
								</Param>
								<Param icon={effectsImg}>{effectsCount ?? '—'}</Param>
							</div>

							<div className='mt-2 text-[12px]'>
								<div>
									СЕРТИФИКАТ:{' '}
									<span className='opacity-80'>{certificate || '—'}</span>
								</div>
								<div className='text-[#28a745] mt-1'>
									В наличии {inStock} шт
								</div>
							</div>

							{/* Цена + кнопки */}
							<div className='mt-3 flex items-center gap-2'>
								<button
									type='button'
									className='w-8 h-8 rounded-[8px] bg-[#efebe6] grid place-items-center'
									title='Уменьшить количество'
								>
									−
								</button>

								<div className='flex-1 h-10 rounded-[10px] bg-firework-radial text-white grid place-items-center font-semibold'>
									{typeof discountPrice === 'number' ? (
										<>
											<span className='line-through opacity-70 mr-2'>
												{fmtPrice(price)}
											</span>
											<span>{fmtPrice(discountPrice)}</span>
										</>
									) : (
										<span>{fmtPrice(price)}</span>
									)}
								</div>

								<button
									onClick={() => dispatch(addItem(product))}
									className='w-8 h-8 rounded-[8px] bg-[#cbb7ff] grid place-items-center text-[18px]'
									aria-label='Добавить в корзину'
									title='Добавить в корзину'
								>
									+
								</button>
							</div>
						</div>
					</aside>
				</div>

				{/* Описание (скроллимое, чтобы всё влезло в 834px) */}
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
