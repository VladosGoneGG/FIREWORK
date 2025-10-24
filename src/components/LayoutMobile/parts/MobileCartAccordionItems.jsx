// src/components/LayoutMobile/parts/MobileCartAccordionItems.jsx
import { memo, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeItem, updateQuantity } from '../../../store/slices/cartSlice'
import CartFooter from '../../ProductCart/parts/CartFooter'
import CartItem from '../../ProductCart/parts/CartItem'

const MIN_ORDER = 4800

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

	const handleContinue = () => {
		onClose?.()
	}

	return (
		// Внешний контейнер: добавили нижний отступ 10px (pb-2.5)
		<div className='w-full pb-2.5'>
			<div
				className={[
					'rounded-[20px] bg-white',
					'shadow-[0_5px_20px_rgba(0,0,0,0.18)]',
					'overflow-hidden flex flex-col font-baron',
				].join(' ')}
				// плитка на 10px ниже исходной высоты
				style={{ height: Math.max(0, (Number(height) || 0) - 10) }}
			>
				{/* «хэндл» сверху */}
				<div className='pt-2 pb-2.5 px-3'>
					<div className='mx-auto w-10 h-[4px] bg-[#efebe6] rounded-full' />
				</div>

				{/* список товаров */}
				<div className='flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3 scroll-hidden'>
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
				</div>

				<CartFooter
					total={total}
					minOrder={MIN_ORDER}
					onContinue={handleContinue}
				/>
			</div>
		</div>
	)
}

export default memo(MobileCartAccordionItems)
