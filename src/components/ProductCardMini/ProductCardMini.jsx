// src/components/ProductCardMini/ProductCardMini.jsx
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addItem } from '../../store/slices/cartSlice'

// если у тебя есть свои SVG-иконки — подставь их вместо 🧨 🔘 ⏱ ⭐
const Param = ({ icon, children }) => (
	<div className='flex items-center gap-1 text-[12px] text-[#6b6b6b]'>
		<span aria-hidden>{icon}</span>
		<span className='font-medium text-[#4a4a4a]'>{children}</span>
	</div>
)

const fmtSec = s => (s >= 60 ? `${Math.floor(s / 60)}м ${s % 60}с` : `${s}с`)
const fmtPrice = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'

const ProductCardMini = ({ product }) => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const add = e => {
		e.stopPropagation()
		dispatch(addItem(product))
	}

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
	} = product

	const img = images[0]

	return (
		<article
			role='button'
			tabIndex={0}
			onClick={() => navigate(`/product/${id}`)}
			onKeyDown={e =>
				(e.key === 'Enter' || e.key === ' ') && navigate(`/product/${id}`)
			}
			className='
        bg-white rounded-[16px] p-3 shadow
        hover:shadow-md transition cursor-pointer
        select-none
      '
			title={name}
		>
			{/* фото */}
			<div className='relative aspect-[4/3] rounded-[12px] overflow-hidden bg-[#f6f4f2]'>
				{img ? (
					<img src={img} alt={name} className='w-full h-full object-contain' />
				) : (
					<div className='grid place-items-center w-full h-full text-xs opacity-60'>
						Нет фото
					</div>
				)}
			</div>

			{/* название + производитель */}
			<div className='mt-2'>
				<div className='text-[12px] uppercase opacity-60'>
					{manufacturer || '—'}
				</div>
				<h4 className='font-semibold leading-tight'>{name}</h4>
			</div>

			{/* параметры */}
			<div className='mt-2 grid grid-cols-2 gap-y-1'>
				<Param icon='🧨'>{shots ?? '—'}</Param>
				<Param icon='🔘'>{caliber ?? '—'}</Param>
				<Param icon='⏱'>{durationSec ? fmtSec(durationSec) : '—'}</Param>
				<Param icon='⭐'>{effectsCount ?? '—'}</Param>
			</div>

			{/* цена + кнопка “+” */}
			<div className='mt-3 flex items-end justify-between'>
				<div>
					{discountPrice ? (
						<>
							<div className='text-[12px] line-through opacity-60'>
								{fmtPrice(price)}
							</div>
							<div className='text-[16px] font-semibold'>
								{fmtPrice(discountPrice)}
							</div>
						</>
					) : (
						<div className='text-[16px] font-semibold'>{fmtPrice(price)}</div>
					)}
				</div>

				<button
					onClick={add}
					className='
            w-9 h-9 rounded-full bg-[#cbb7ff]
            grid place-items-center text-[20px] leading-none
            hover:brightness-110 active:scale-95 transition
          '
					aria-label='Добавить в корзину'
					title='Добавить в корзину'
				>
					+
				</button>
			</div>
		</article>
	)
}

export default ProductCardMini
