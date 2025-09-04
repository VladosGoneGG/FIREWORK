// src/components/ProductDetails/ProductDetails.jsx
import { useDispatch } from 'react-redux'
import caliberImg from '../../assets/SVG/radius.svg'
import shotsImg from '../../assets/SVG/rocket.svg'
import effectsImg from '../../assets/SVG/star.svg'
import timeImg from '../../assets/SVG/time.svg'
import { addItem } from '../../store/slices/cartSlice'
import Param from '../Param/Param'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

const fmtSec = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}м ${s % 60}с`
			: `${s}с`
		: '—'
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
        p-4 flex flex-col gap-3
        overflow-hidden
      '
		>
			{/* Верхняя панель: Назад */}
			<div className='flex items-center gap-2 '>
				<button
					onClick={onBack}
					className='text-[12px] px-2 py-1 rounded hover:bg-[#efebe6]'
				>
					← Назад
				</button>
			</div>

			{/* Основной блок: слева медиа, справа карточка */}
			<div className='flex'>
				{/* Медиа слева */}
				<div className='rounded-[12px] overflow-hidden bg-[#f6f4f2] relative min-h-0'>
					{/* задаём высоту через аспект, чтобы вписалось красиво */}
					<div className='w-full h-full aspect-[16/9]'>
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
					</div>
					{/* Кнопка Play-оверлей (декор) */}
					<div className='absolute inset-0 pointer-events-none grid place-items-center'>
						<div className='w-12 h-12 rounded-full bg-black/30 backdrop-blur-[2px] grid place-items-center'>
							<div className='w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1' />
						</div>
					</div>
				</div>

				{/* Правая инфо-карта */}
				<div className='bg-white rounded-[12px] p-3 shadow min-h-0 flex flex-col'>
					{/* Мини-превью */}
					<div className='w-full h-[160px] rounded-[10px] overflow-hidden bg-[#f6f4f2] grid place-items-center'>
						{img ? (
							<img
								src={img}
								alt={name}
								className='w-full h-full object-contain'
							/>
						) : (
							'Нет фото'
						)}
					</div>

					<div className='mt-2'>
						<h3 className='font-semibold leading-tight'>{name}</h3>
						<div className='text-[12px] uppercase opacity-60'>
							{manufacturer || '—'}
						</div>
					</div>

					<div className='mt-2 grid grid-cols-2 gap-y-1 text-[12px]'>
						<Param icon={shotsImg}>{shots ?? '—'}</Param>
						<Param icon={caliberImg}>{caliber ?? '—'}</Param>
						<Param icon={timeImg}>{fmtSec(durationSec)}</Param>
						<Param icon={effectsImg}>{effectsCount ?? '—'}</Param>
					</div>

					<div className='mt-2 text-[12px]'>
						<div>
							СЕРТИФИКАТ:{' '}
							<span className='opacity-80'>{certificate || '—'}</span>
						</div>
						<div className='text-[#28a745] mt-1'>В наличии {inStock} шт</div>
					</div>

					{/* Цена + +/- + добавить */}
					<div className='mt-auto flex items-center gap-2'>
						<button className='w-8 h-8 rounded-[8px] bg-[#efebe6] grid place-items-center'>
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
						>
							+
						</button>
					</div>
				</div>
			</div>

			{/* Описание (прокручиваемая зона, чтобы всё влезло в 834px) */}
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
		</section>
	)
}

export default ProductDetails
