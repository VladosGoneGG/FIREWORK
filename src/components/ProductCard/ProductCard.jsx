import { useDispatch } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice'
import { fmtPriceRub, fmtSecFull } from '../../utils/format'

const ProductCard = ({ product }) => {
	const dispatch = useDispatch()
	const add = () => dispatch(addItem(product))

	const {
		images = [],
		video,
		name,
		manufacturer,
		shots,
		caliber,
		durationSec,
		effectsCount,
		price,
		discountPrice,
		stock,
	} = product

	const img = images[0]

	return (
		<div className='bg-white rounded-[16px] p-3 shadow flex flex-col'>
			{/* Медиа */}
			<div className='relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#f6f4f2]'>
				{img ? (
					<img src={img} alt={name} className='w-full h-full object-contain' />
				) : (
					<div className='w-full h-full grid place-items-center text-sm opacity-60'>
						Нет фото
					</div>
				)}
				{video && (
					<div className='absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white'>
						Видео
					</div>
				)}
			</div>

			{/* Название + производитель */}
			<div className='mt-2'>
				<div className='text-[12px] uppercase opacity-60'>
					{manufacturer || '—'}
				</div>
				<h4 className='font-semibold leading-snug'>{name}</h4>
			</div>

			{/* Параметры */}
			<div className='mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]'>
				<div className='opacity-60'>Залпов</div>
				<div className='font-medium'>{shots ?? '—'}</div>
				<div className='opacity-60'>Калибр</div>
				<div className='font-medium'>{caliber ?? '—'}</div>
				<div className='opacity-60'>Длительность</div>
				<div className='font-medium'>
					{durationSec ? fmtSecFull(durationSec) : '—'}
				</div>
				<div className='opacity-60'>Эффектов</div>
				<div className='font-medium'>{effectsCount ?? '—'}</div>
				<div className='opacity-60'>Склад</div>
				<div className='font-medium'>{stock ?? 0}</div>
				<div className='opacity-60'>Сертификат</div>
				<div
					className='font-medium truncate'
					title={product.certificate || '—'}
				>
					{product.certificate || '—'}
				</div>
			</div>

			{/* Цена + действие */}
			<div className='mt-3 flex items-end justify-between'>
				<div>
					{discountPrice ? (
						<>
							<div className='text-[12px] line-through opacity-60'>
								{fmtPriceRub(price)}
							</div>
							<div className='text-[16px] font-semibold'>
								{fmtPriceRub(discountPrice)}
							</div>
						</>
					) : (
						<div className='text-[16px] font-semibold'>
							{fmtPriceRub(price)}
						</div>
					)}
				</div>
				<button
					onClick={add}
					className='h-[36px] px-3 rounded-[10px] bg-firework-red text-white hover:brightness-110 active:brightness-95 transition'
				>
					В корзину
				</button>
			</div>
		</div>
	)
}

export default ProductCard
