import { useDispatch, useSelector } from 'react-redux'
import { removeItem, updateQuantity } from '../../store/slices/cartSlice'

const formatPrice = n => new Intl.NumberFormat('ru-RU').format(n) + '₽'

const Qty = ({ value, onDec, onInc }) => (
	<div className='inline-flex items-center gap-2 h-7 px-2 rounded-full bg-[#f2f0ed]'>
		<button
			onClick={onDec}
			className='w-6 h-6 grid place-items-center rounded-full hover:bg-black/10'
		>
			–
		</button>
		<span className='min-w-4 text-sm'>{value}</span>
		<button
			onClick={onInc}
			className='w-6 h-6 grid place-items-center rounded-full hover:bg-black/10'
		>
			+
		</button>
	</div>
)

const ProductCart = () => {
	const dispatch = useDispatch()
	const { items, total } = useSelector(s => s.cart)

	const inc = (id, v) => dispatch(updateQuantity({ id, quantity: v + 1 }))
	const dec = (id, v) =>
		dispatch(updateQuantity({ id, quantity: Math.max(1, v - 1) }))

	return (
		<aside
			className='
        bg-white rounded-[20px] w-[295px] h-[834px]
        shadow-[0_0_15px_rgba(0,0,0,0.15)]
        flex flex-col overflow-hidden
      '
		>
			{/* Header */}
			<div className='px-4 pt-4 pb-3'>
				<h3 className='text-[18px] font-semibold tracking-wide'>КОРЗИНА</h3>
			</div>

			{/* Разделительная линия */}
			<div className='h-px bg-[#efebe6]' />

			{/* Список — СКРОЛЛИТСЯ */}
			<div className='flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-hidden'>
				{items.length === 0 ? (
					<div className='opacity-60 text-sm'>Пусто</div>
				) : (
					items.map(it => (
						<div key={it.id} className='flex items-center gap-3'>
							{/* Фото товара (если есть) */}
							<div className='w-[72px] h-[56px] rounded-[10px] overflow-hidden bg-[#f6f4f2] flex-shrink-0'>
								{it.images?.[0] ? (
									<img
										src={it.images[0]}
										alt={it.name}
										className='w-full h-full object-cover'
									/>
								) : null}
							</div>

							{/* Инфо */}
							<div className='flex-1 min-w-0'>
								<div className='font-semibold leading-tight truncate'>
									{it.name}
								</div>
								<div className='text-[11px] opacity-60 uppercase'>
									{it.manufacturer || ''}
								</div>

								<div className='mt-1 flex items-center justify-between'>
									<Qty
										value={it.quantity}
										onDec={() => dec(it.id, it.quantity)}
										onInc={() => inc(it.id, it.quantity)}
									/>
									<div className='text-right'>
										<div className='font-semibold'>{formatPrice(it.price)}</div>
									</div>
								</div>
							</div>

							{/* Удалить */}
							<button
								className='self-start p-2 rounded hover:bg-red-500/10'
								onClick={() => dispatch(removeItem(it.id))}
								title='Удалить'
								aria-label='Удалить'
							>
								×
							</button>
						</div>
					))
				)}
			</div>

			{/* Footer — фиксированно внизу */}
			<div className='mt-auto px-4 pb-4 pt-3 bg-white'>
				<div className='text-center text-[11px] uppercase opacity-60'>
					итого
				</div>
				<div className='text-center text-[20px] font-extrabold tracking-wide'>
					{formatPrice(total)}
				</div>

				<button className='btn-firework w-full mt-3 h-[44px] rounded-[12px]'>
					ПРОДОЛЖИТЬ
				</button>
			</div>
		</aside>
	)
}

export default ProductCart
