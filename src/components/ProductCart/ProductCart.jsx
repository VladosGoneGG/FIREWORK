import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	clearCart,
	removeItem,
	updateQuantity,
} from '../../store/slices/cartSlice'

import CheckoutForm from './CheckoutForm'
import CartFooter from './parts/CartFooter'
import CartHeader from './parts/CartHeader'
import CartItem from './parts/CartItem'
import ProductCartSkeleton from './parts/ProductCartSkeleton'

const MIN_ORDER = 4800
const selectCart = s => s.cart

const ProductCart = ({ loading = false }) => {
	const dispatch = useDispatch()
	const { items = [], total = 0 } = useSelector(selectCart) || {}
	const isLoading = loading || items == null

	const formRef = useRef(null)
	const [showForm, setShowForm] = useState(false)
	const [success, setSuccess] = useState(false)

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

	useEffect(() => {
		if (!items.length) {
			setShowForm(false)
			setSuccess(false)
		}
	}, [items.length])

	const list = useMemo(() => items, [items])

	const handleContinue = async () => {
		console.log('[Cart] continue clicked')
		if (!showForm) {
			setShowForm(true)
			setTimeout(() => formRef.current?.focusFirst?.(), 0)
			return
		}
		// когда форма уже открыта — сначала провалидируем,
		// и только если всё ок — сабмитим
		const ok = await formRef.current?.validate?.()
		if (ok) formRef.current?.submit?.()
	}

	const handleOrderSubmitted = data => {
		console.log('[Cart] ORDER_SUBMIT_PAYLOAD:', data)
		setSuccess(true)
		setShowForm(false)

		const t = setTimeout(() => {
			dispatch(clearCart())
			setSuccess(false)
		}, 5000)
		return () => clearTimeout(t)
	}

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

			<div className='flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-hidden relative'>
				{list.length === 0 ? (
					<div className='opacity-60 text-sm'>пусто</div>
				) : (
					list.map(it => (
						<CartItem
							key={it.id}
							item={it}
							onDec={() => dec(it.id, it.quantity)}
							onInc={() => inc(it.id, it.quantity)}
						/>
					))
				)}

				{showForm && !success && list.length > 0 && (
					<div className='mt-3'>
						<CheckoutForm ref={formRef} onSubmitted={handleOrderSubmitted} />
					</div>
				)}

				{success && (
					<div className='absolute z-20 inset-0 grid place-items-center bg-white backdrop-blur-[1px] p-6'>
						<div className='text-center'>
							<div className='text-sm text-stone-700'>
								как только заказ будет собран, вам придёт SMS-оповещение
							</div>
						</div>
					</div>
				)}
			</div>

			{!success && (
				<CartFooter
					total={total}
					minOrder={MIN_ORDER}
					onContinue={handleContinue}
				/>
			)}
		</aside>
	)
}

export default memo(ProductCart)
