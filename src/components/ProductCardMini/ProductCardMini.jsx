import { useDispatch } from 'react-redux'
import caliberImg from '../../assets/SVG/radius.svg'
import shotsImg from '../../assets/SVG/rocket.svg'
import effectsImg from '../../assets/SVG/star.svg'
import timeImg from '../../assets/SVG/time.svg'
import { addItem } from '../../store/slices/cartSlice'
import Param from '../Param/Param'

const fmtSecFull = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}м ${s % 60}с`
			: `${s}с`
		: '—'

const fmtSecCompact = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
			: `${s}с`
		: '—'

const fmtPrice = n =>
	typeof n === 'number' ? new Intl.NumberFormat('ru-RU').format(n) + '' : '—'

const ProductCardMini = ({ product, onSelect }) => {
	const dispatch = useDispatch()

	const {
		id,
		name,
		manufacturer,
		images = [],
		shots,
		caliber,
		durationSec,
		effectsCount,
		price,
		discountPrice,
		stock,
	} = product

	const img = images[0]
	const outOfStock = Number(stock) === 0

	const onKey = e => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onSelect?.(product)
		}
	}
	const add = e => {
		e.stopPropagation()
		if (!outOfStock) dispatch(addItem(product))
	}

	return (
		<article
			role='button'
			tabIndex={0}
			aria-label={`Открыть товар: ${name}`}
			onClick={() => onSelect?.(product)}
			onKeyDown={onKey}
			title={name}
			className='w-[120px] h-[206px] bg-white'
		>
			<div className='h-full w-full flex flex-col font-inter'>
				{/* Фото 100×100 */}
				<div className='mx-auto w-[120px] h-[100px] rounded-[12px] overflow-hidden relative'>
					{img ? (
						<img
							src={img}
							alt={name}
							loading='lazy'
							className='w-full h-full object-contain cursor-pointer'
						/>
					) : (
						<div className='grid place-items-center w-full h-full text-xs opacity-60'>
							Нет фото
						</div>
					)}
					{outOfStock && (
						<div className='absolute left-1 top-1 px-1.5 py-[1px] rounded-[6px] text-[9px] bg-black/60 text-white'>
							Нет в наличии
						</div>
					)}
				</div>

				{/* Название + производитель */}
				<div className='text-center'>
					<h4 className='font-semibold leading-tight break-words line-clamp-1 text-[12px]'>
						{name}
					</h4>
					<div className='text-[8px] font-bold uppercase '>
						{manufacturer || '—'}
					</div>
				</div>

				{/* Параметры */}
				<div className='flex text-[12px] justify-evenly'>
					<div className='flex flex-col'>
						<Param icon={shotsImg}>{shots ?? '—'}</Param>
						<Param icon={timeImg} title={fmtSecFull(durationSec)}>
							{fmtSecCompact(durationSec)}
						</Param>
					</div>
					<div className='flex flex-col '>
						<Param icon={caliberImg}>{caliber ?? '—'}</Param>
						<Param icon={effectsImg}>{effectsCount ?? '—'}</Param>
					</div>
				</div>

				{/* Цена + кнопка */}
				<div className='mt-auto flex items-end justify-between'>
					<div className='ml-3'>
						{typeof discountPrice === 'number' ? (
							<>
								<div className='text-[8px] line-through text-[#BD52E9] font-bold'>
									{fmtPrice(price)}
								</div>
								<div className='text-[12px] font-semibold'>
									{fmtPrice(discountPrice)}{' '}
									<span className='text-[8px] font-inter relative top-0.5'>
										РУБ.
									</span>
								</div>
							</>
						) : (
							<div className='text-[12px] font-semibold'>
								{fmtPrice(price)}{' '}
								<span className='text-[8px] font-inter relative top-0.5'>
									РУБ.
								</span>
							</div>
						)}
					</div>

					<button
						type='button'
						onClick={add}
						disabled={outOfStock}
						aria-disabled={outOfStock}
						className={`
              w-[40px] h-[25px] rounded-[10px] grid place-items-center text-[20px] leading-none transition cursor-pointer
              ${
								outOfStock
									? 'bg-[#e5e2de] text-[#9c9c9c] cursor-not-allowed'
									: 'bg-[#cbb7ff] hover:brightness-110 active:scale-95'
							}
            `}
						title={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
						aria-label={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
						onMouseDown={e => e.stopPropagation()}
					>
						+
					</button>
				</div>
			</div>
		</article>
	)
}

export default ProductCardMini
