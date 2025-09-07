import { memo } from 'react'

const Qty = ({ value, onDec, onInc, className = '' }) => (
	<div
		className={
			'font-baron lowercase inline-flex items-center gap-2 w-[50px] h-[20px] rounded-full bg-[#f2f0ed] ' +
			className
		}
	>
		<button
			type='button'
			onClick={onDec}
			className='w-6 h-6 grid place-items-center rounded-full hover:bg-black/10'
			aria-label='Уменьшить'
			title='Уменьшить'
		>
			–
		</button>
		<span className='min-w-4 text-sm'>{value}</span>
		<button
			type='button'
			onClick={onInc}
			className='w-6 h-6 grid place-items-center rounded-full hover:bg-black/10'
			aria-label='Увеличить'
			title='Увеличить'
		>
			+
		</button>
	</div>
)

export default memo(Qty)
