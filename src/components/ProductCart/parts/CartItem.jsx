// src/components/ProductCart/parts/CartItem.jsx
import { memo } from 'react'
import { fmtPriceRub } from '../../../utils/format'
import Qty from './Qty'

const CartItem = ({ item, onDec, onInc }) => {
	const priceText = fmtPriceRub(item.price)

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

				<div className='mt-1 flex items-center justify-between'>
					<Qty value={item.quantity} onDec={onDec} onInc={onInc} />
					<div className='text-[18px] font-bold pr-2.5'>
						{priceText}
						<span className='text-[10px] font-baron lowercase relative top-0.5 right-1.5'>
							руб.
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(CartItem)
