// src/components/ProductCart/ProductCart.jsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import sucessSvg from '../../assets/SVG/sucess.svg'
import {
	clearCart,
	removeItem,
	updateQuantity,
} from '../../store/slices/cartSlice'
import { buildOrderPayload, sendOrder } from '../../utils/orderApi'
import CheckoutForm from './CheckoutForm'
import CartFooter from './parts/CartFooter'
import CartHeader from './parts/CartHeader'
import CartItem from './parts/CartItem'
import ProductCartSkeleton from './parts/ProductCartSkeleton'

const MIN_ORDER = 4800
const selectCart = s => s.cart

const ProductCart = ({ loading = false }) => {
	const dispatch = useDispatch()
	const cartState = useSelector(selectCart)
	const { items = [], total = 0 } = cartState || {}
	const isLoading = loading || items == null

	const formRef = useRef(null)
	const [showForm, setShowForm] = useState(false)
	const [success, setSuccess] = useState(false)

	// прокручиваемая область и сама форма:
	const listScrollRef = useRef(null)
	const formContainerRef = useRef(null)

	const inc = useCallback(
		(id, v) => dispatch(updateQuantity({ id, quantity: v + 1 })),
		[dispatch]
	)

	const dec = useCallback(
		(id, v) => {
			if (v <= 1) dispatch(removeItem(id))
			else dispatch(updateQuantity({ id, quantity: v - 1 }))
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

	const scrollFormBottomIntoView = () => {
		const scroller = listScrollRef.current
		const formEl = formContainerRef.current
		if (!scroller || !formEl) return

		// целевой top = низ формы минус видимая высота контейнера
		const formBottom = formEl.offsetTop + formEl.offsetHeight
		const targetTop = Math.max(0, formBottom - scroller.clientHeight)

		scroller.scrollTo({ top: targetTop, behavior: 'smooth' })
	}

	const handleContinue = async () => {
		if (!showForm) {
			setShowForm(true)
			// даём дорисоваться DOM, фокусируем телефон и прокручиваем НИЗ формы в видимую область
			requestAnimationFrame(() => {
				formRef.current?.focusFirst?.()
				requestAnimationFrame(() => {
					scrollFormBottomIntoView()
					// на случай поздней подгрузки шрифтов/картинок — ещё одна попытка
					setTimeout(scrollFormBottomIntoView, 60)
				})
			})
			return
		}
		const ok = await formRef.current?.validate?.()
		if (ok) formRef.current?.submit?.()
	}

	const handleOrderSubmitted = async formData => {
		const payload = buildOrderPayload(formData, { items, total })
		await sendOrder(payload)
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
			<div className='w-[260px] h-[2px] ml-[15px] rounded-[20px] bg-[#efebe6]' />

			<div
				ref={listScrollRef}
				className={[
					'flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-hidden relative',
					success ? 'pointer-events-none' : 'pointer-events-auto',
				].join(' ')}
				aria-hidden={success}
			>
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
					<div ref={formContainerRef} className='mt-3'>
						<CheckoutForm ref={formRef} onSubmitted={handleOrderSubmitted} />
					</div>
				)}

				{success && (
					<div className='absolute z-20 inset-0 flex justify-center items-center bg-white p-6 pointer-events-auto'>
						<div className='flex flex-col gap-[24px] justify-center items-center'>
							<img src={sucessSvg} alt='Успех' />
							<div className='text-[12px] font-baron text-stone-700'>
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
