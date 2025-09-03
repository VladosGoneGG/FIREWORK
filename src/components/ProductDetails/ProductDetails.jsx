import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

const fmtSec = s => (s >= 60 ? `${Math.floor(s / 60)}м ${s % 60}с` : `${s}с`)
const fmtPrice = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'

const ProductDetails = () => {
	const { id } = useParams()
	const product = useSelector(s =>
		s.products.items.find(p => String(p.id) === id)
	)

	if (!product) {
		return (
			<div className='max-w-[960px] mx-auto p-4'>
				<Link to='/' className='underline'>
					← назад
				</Link>
				<div className='mt-4'>Товар не найден</div>
			</div>
		)
	}

	const {
		name,
		manufacturer,
		images = [],
		video,
		description,
		shots,
		caliber,
		durationSec,
		effectsCount,
		certificate,
		stock,
		price,
		discountPrice,
	} = product

	return (
		<div className='max-w-[960px] mx-auto p-4 space-y-4'>
			<Link to='/' className='underline'>
				← назад
			</Link>

			<div className='bg-white rounded-[20px] p-5 shadow grid grid-cols-2 gap-5 max-[900px]:grid-cols-1'>
				{/* Медиа */}
				<div className='space-y-3'>
					<div className='aspect-[4/3] bg-[#f6f4f2] rounded-[12px] overflow-hidden'>
						{images[0] && (
							<img
								src={images[0]}
								alt={name}
								className='w-full h-full object-contain'
							/>
						)}
					</div>
					{video && (
						<video
							src={video}
							controls
							className='w-full rounded-[12px] bg-black'
						/>
					)}
				</div>

				{/* Инфо */}
				<div className='space-y-3'>
					<div className='text-[12px] uppercase opacity-60'>{manufacturer}</div>
					<h1 className='text-2xl font-semibold'>{name}</h1>

					<div className='grid grid-cols-2 gap-x-6 gap-y-1 text-[14px]'>
						<div className='opacity-60'>Залпов</div>
						<div className='font-medium'>{shots ?? '—'}</div>
						<div className='opacity-60'>Калибр</div>
						<div className='font-medium'>{caliber ?? '—'}</div>
						<div className='opacity-60'>Длительность</div>
						<div className='font-medium'>
							{durationSec ? fmtSec(durationSec) : '—'}
						</div>
						<div className='opacity-60'>Эффектов</div>
						<div className='font-medium'>{effectsCount ?? '—'}</div>
						<div className='opacity-60'>Склад</div>
						<div className='font-medium'>{stock ?? 0}</div>
						<div className='opacity-60'>Сертификат</div>
						<div className='font-medium break-words'>{certificate || '—'}</div>
					</div>

					<div>
						{discountPrice ? (
							<>
								<div className='text-[14px] line-through opacity-60'>
									{fmtPrice(price)}
								</div>
								<div className='text-[22px] font-semibold'>
									{fmtPrice(discountPrice)}
								</div>
							</>
						) : (
							<div className='text-[22px] font-semibold'>{fmtPrice(price)}</div>
						)}
					</div>

					{description && (
						<div className='pt-2 text-[14px] opacity-80 leading-relaxed'>
							{description}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ProductDetails
