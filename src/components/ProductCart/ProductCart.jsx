import { useDispatch, useSelector } from 'react-redux'
import {
	clearCart,
	removeItem,
	updateQuantity,
} from '../../store/slices/cartSlice'

const ProductCart = () => {
	const dispatch = useDispatch()
	const { items, total } = useSelector(s => s.cart)

	const changeQty = (id, qty) => {
		const q = Math.max(1, Number(qty) || 1)
		dispatch(updateQuantity({ id, quantity: q }))
	}

	return (
		<div className='bg-white rounded-xl p-3 shadow sticky top-[84px]'>
			<h3 className='font-semibold mb-3'>Корзина</h3>

			{items.length === 0 ? (
				<div className='opacity-60 text-sm'>Пусто</div>
			) : (
				<div className='space-y-2'>
					{items.map(it => (
						<div
							key={it.id}
							className='flex items-center justify-between gap-2'
						>
							<div className='min-w-0'>
								<div className='font-medium truncate max-w-[160px]'>
									{it.name}
								</div>
								<div className='text-xs opacity-60'>{it.price} ₽</div>
							</div>

							<input
								type='number'
								min={1}
								value={it.quantity}
								onChange={e => changeQty(it.id, e.target.value)}
								className='w-16 px-2 py-1 rounded border'
							/>

							<button
								className='p-2 rounded hover:bg-red-500/10'
								onClick={() => dispatch(removeItem(it.id))}
								title='Удалить'
							></button>
						</div>
					))}

					<div className='pt-2 border-t flex items-center justify-between'>
						<div className='font-semibold'>Итого:</div>
						<div className='font-semibold'>{total} ₽</div>
					</div>

					<div className='flex gap-2'>
						<button className='btn-firework flex-1'>Оформить</button>
						<button
							className='flex-1 rounded-[10px] h-[50px] uppercase border hover:bg-black/5 transition'
							onClick={() => dispatch(clearCart())}
						>
							очистить
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default ProductCart
