import { memo } from 'react'

const CartHeader = () => (
	<div className='px-4 pt-4 pb-3'>
		<h3 className='text-[18px] font-semibold tracking-wide text-[#625a51]'>
			корзина
		</h3>
	</div>
)

export default memo(CartHeader)
