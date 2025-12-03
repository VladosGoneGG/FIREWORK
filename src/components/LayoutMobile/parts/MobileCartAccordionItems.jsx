// src/components/LayoutMobile/parts/MobileCartAccordionItems.jsx
import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import sucessSvg from '../../../assets/SVG/sucess.svg'
import {
	clearCart,
	removeItem,
	updateQuantity,
} from '../../../store/slices/cartSlice'
import { MIN_ORDER_AMOUNT } from '../../../constants/orders'
import { buildOrderPayload, sendOrder } from '../../../utils/orderApi'
import CheckoutForm from '../../ProductCart/CheckoutForm'
import CartFooter from '../../ProductCart/parts/CartFooter'
import CartItem from '../../ProductCart/parts/CartItem'
const selectCartItems = s => s?.cart?.items || []

const num = v => (typeof v === 'number' ? v : Number(v) || 0)
const getUnit = it => {
	if (!Number.isNaN(num(it.unitPrice))) return num(it.unitPrice)
	if (!Number.isNaN(num(it.discountPrice))) return num(it.discountPrice)
	return num(it.price)
}

function MobileCartAccordionItems({ height = 360, onClose }) {
	const dispatch = useDispatch()
	const items = useSelector(selectCartItems)

	const total = useMemo(
		() =>
			items.reduce(
				(sum, it) => sum + getUnit(it) * Math.max(1, num(it.quantity)),
				0
			),
		[items]
	)

	const inc = useCallback(
		(id, v) => dispatch(updateQuantity({ id, quantity: (Number(v) || 1) + 1 })),
		[dispatch]
	)
	const dec = useCallback(
		(id, v) => {
			const q = Number(v) || 1
			if (q <= 1) dispatch(removeItem(id))
			else dispatch(updateQuantity({ id, quantity: q - 1 }))
		},
		[dispatch]
	)

	const formRef = useRef(null)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [success, setSuccess] = useState(false)

	// якорь — чтобы при открытии формы прокрутить контейнер к ней (если нужно)
	const formAnchorRef = useRef(null)
	useEffect(() => {
		if (!sheetOpen) return
		const id = requestAnimationFrame(() => {
			formAnchorRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
			formRef.current?.focusFirst?.()
		})
		return () => cancelAnimationFrame(id)
	}, [sheetOpen])

	const handleContinue = async () => {
		if (!items.length) return
		if (!sheetOpen) {
			setSheetOpen(true) // первый клик — показываем форму
			return
		}
		// если форма уже открыта — валидируем и отправляем
		const ok = await formRef.current?.validate?.()
		if (ok) formRef.current?.submit?.()
	}

	const handleOrderSubmitted = async formData => {
		const payload = buildOrderPayload(formData, { items, total })
		await sendOrder(payload)

		setSuccess(true)
		setSheetOpen(false)

		const t = setTimeout(() => {
			dispatch(clearCart())
			setSuccess(false)
			onClose?.()
		}, 3000)
		return () => clearTimeout(t)
	}

	// Карточка остаётся фиксированной по высоте (как у тебя было),
	// контентная область внутри — "сцена" с двумя слоями (список и форма), которые анимированно меняют положение.
	const cardH = Math.max(0, (Number(height) || 0) - 10)

	return (
		<div className='w-full pb-2.5'>
			<div
				className={[
					'rounded-[20px] bg-white',
					'shadow-[0_5px_20px_rgba(0,0,0,0.18)]',
					'overflow-hidden flex flex-col font-baron',
				].join(' ')}
				style={{ height: cardH }}
			>
				{/* Заголовок + разделитель (твои стили) */}
				<div className='px-3 pt-2'>
					<div className='text-sm text-start font-baron lowercase py-2'>
						корзина
					</div>
					<div className='w-full h-[2px] bg-[#efebe6] rounded-full' />
				</div>

				{/* СЦЕНА: два слоя в одном контейнере */}
				<div className='flex-1 min-h-0 relative overflow-hidden'>
					{/* Слой со списком — уезжает вверх */}
					<motion.div
						className='absolute inset-0'
						initial={false}
						animate={{ y: sheetOpen ? '-100%' : '0%' }}
						transition={{ type: 'spring', stiffness: 260, damping: 28 }}
					>
						<div
							className={[
								'h-full overflow-y-auto px-3 pb-3 space-y-3 scroll-hidden relative',
								success ? 'pointer-events-none' : 'pointer-events-auto',
							].join(' ')}
							aria-hidden={success}
						>
							{items.length === 0 ? (
								<div className='opacity-60 text-sm text-center font-baron lowercase py-2'>
									корзина пуста
								</div>
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

							{/* успех поверх слоя списка */}
							{success && (
								<div className='absolute inset-0 flex justify-center items-center bg-white p-6 z-10 pointer-events-auto'>
									<div className='flex flex-col gap-[24px] justify-center items-center'>
										<img src={sucessSvg} alt='Успех' />
										<div className='text-[12px] font-baron text-stone-700'>
											как только заказ будет собран, вам придёт SMS-оповещение
										</div>
									</div>
								</div>
							)}
						</div>
					</motion.div>

					{/* Слой с формой — выезжает снизу и занимает всю сцену */}
					<motion.div
						className='absolute inset-0'
						initial={false}
						animate={{ y: sheetOpen ? '0%' : '100%' }}
						transition={{ type: 'spring', stiffness: 260, damping: 28 }}
					>
						{/* якорь, чтобы при открытии прокрутиться к началу формы, если сцена ниже вьюпорта */}
						<div ref={formAnchorRef} />
						{/* контейнер формы — свой скролл, чтобы форма была полностью видна */}
						<div className='h-full overflow-y-auto scroll-hidden'>
							<div className='px-2'>
								{/* ВНУТРИ — твоя форма без изменений классов */}
								<CheckoutForm
									ref={formRef}
									onSubmitted={handleOrderSubmitted}
								/>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Футер — остаётся на месте */}
				<CartFooter
					total={total}
					minOrder={MIN_ORDER_AMOUNT}
					onContinue={handleContinue}
				/>
			</div>
		</div>
	)
}

export default memo(MobileCartAccordionItems)
