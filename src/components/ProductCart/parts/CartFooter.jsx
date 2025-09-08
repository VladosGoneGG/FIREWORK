// src/components/ProductCart/parts/CartFooter.jsx
import { memo } from 'react'
import { fmtPriceRub } from '../../../utils/format'

const CartFooter = ({ total }) => {
	return (
		<div className='mt-auto px-4 pb-4 pt-3 bg-white'>
			<div className='text-center text-[8px] lowercase font-baron text-[#b4b4b4] '>
				итого
			</div>
			<div className='text-center text-[20px] font-extrabold tracking-wide'>
				{fmtPriceRub(total)}
				<span className='text-[10px] font-baron lowercase relative right-1.5 top-0.5'>
					руб.
				</span>
			</div>

			<button className='btn-firework w-full mt-3 h-[44px] rounded-[12px]'>
				продолжить
			</button>
		</div>
	)
}

export default memo(CartFooter)
