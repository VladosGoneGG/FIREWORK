// src/components/ProductCart/parts/CartItem.jsx
import { memo } from 'react'
import { fmtPriceRub } from '../../../utils/format'
import Qty from './Qty'

const CartItem = ({ item, onDec, onInc }) => {
	// 1) Цена за единицу (с учётом акции)
	const unitPrice =
		typeof item?.discountPrice === 'number'
			? item.discountPrice
			: item?.price || 0

	// 2) Количество
	const qty = Math.max(1, item.quantity || 1)

	// 3) Общая сумма за позицию
	const lineTotal = unitPrice * qty

	// 4) Нужна ли «старая» цена
	const hasOldPrice =
		typeof item?.discountPrice === 'number' &&
		typeof item?.price === 'number' &&
		item.price > item.discountPrice

	return (
		<div className='flex items-center gap-3'>
			<div className='w-[70px] h-[70px] rounded-[10px] overflow-hidden bg-[#f6f4f2] flex-shrink-0'>
				{item.images?.[0] ? (
					<img
						src={item.images[0]}
						alt={item.name}
						className='w-full h-full object-cover'
					/>
				) : null}
			</div>

			<div className='flex-1 min-w-0'>
				<div className='leading-tight truncate'>{item.name}</div>
				<div className='text-[8px] text-[#625A51]'>
					{item.manufacturer || ''}
				</div>

				{/* Старая цена, если есть */}
				{hasOldPrice && (
					<div
						className='text-[10px] text-[#BD52E9] line-through decoration-1 mt-0.5'
						title='Старая цена'
					>
						{fmtPriceRub(item.price)}
						<span className='lowercase'>руб.</span>
					</div>
				)}

				<div className='mt-1 flex items-center justify-between'>
					<Qty value={qty} onDec={onDec} onInc={onInc} />

					{/* Общая сумма за позицию */}
					<div className='text-right pr-2.5'>
						<div className='text-[18px] font-bold'>
							{fmtPriceRub(lineTotal)}
							<span className='text-[10px] font-baron lowercase relative top-0.5 right-1.5'>
								руб.
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(CartItem)
