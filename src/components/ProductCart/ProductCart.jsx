// src/components/ProductCart/ProductCart.jsx
import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeItem, updateQuantity } from '../../store/slices/cartSlice'
import CartFooter from './parts/CartFooter'
import CartHeader from './parts/CartHeader'
import CartItem from './parts/CartItem'
import ProductCartSkeleton from './parts/ProductCartSkeleton'

const selectCart = s => s.cart

const ProductCart = ({ loading = false }) => {
	const dispatch = useDispatch()
	const { items, total } = useSelector(selectCart)
	const isLoading = loading || items == null

	const inc = useCallback(
		(id, v) => dispatch(updateQuantity({ id, quantity: v + 1 })),
		[dispatch]
	)

	const dec = useCallback(
		(id, v) => {
			if (v <= 1) {
				dispatch(removeItem(id))
			} else {
				dispatch(updateQuantity({ id, quantity: v - 1 }))
			}
		},
		[dispatch]
	)

	if (isLoading) return <ProductCartSkeleton />

	return (
		<aside
			className='
        bg-white rounded-[20px] w-[295px] h-[834px]
        shadow-[0_0_15px_rgba(0,0,0,0.15)]
        flex flex-col overflow-hidden font-baron lowercase
      '
		>
			<CartHeader />

			<div className='w-[260px] h-[2px] ml-[18px] rounded-[20px] bg-[#efebe6]' />

			<div className='flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-hidden'>
				{items.length === 0 ? (
					<div className='opacity-60 text-sm'>пусто</div>
				) : (
					items.map(it => (
						<CartItem
							key={it.id}
							item={it}
							onDec={() => dec(it.id, it.quantity)}
							onInc={() => inc(it.id, it.quantity)}
						/>
					))
				)}
			</div>

			<CartFooter total={total} />
		</aside>
	)
}

export default memo(ProductCart)
