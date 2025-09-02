import { useDispatch } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice'

const ProductCard = ({ product }) => {
	const dispatch = useDispatch()
	const add = () => dispatch(addItem(product))

	return (
		<div className='bg-white rounded-xl p-3 shadow flex flex-col justify-between'>
			<div>
				<div className='text-sm opacity-70'>{product.category}</div>
				<h4 className='font-semibold'>{product.name}</h4>
				{product.subcategory ? (
					<div className='text-xs opacity-60'>{product.subcategory}</div>
				) : null}
				<p className='mt-2 text-sm opacity-80'>{product.description}</p>
			</div>

			<div className='mt-3 flex items-center justify-between'>
				<div className='font-semibold'>{product.price} ₽</div>
				<button
					onClick={add}
					title='Добавить в корзину'
					className='inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-firework-red text-white hover:brightness-110 active:brightness-95 transition'
				>
					В корзину
				</button>
			</div>
		</div>
	)
}

export default ProductCard
