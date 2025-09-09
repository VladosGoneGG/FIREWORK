import { memo } from 'react'

const Qty = ({ value, onDec, onInc, className = '' }) => (
	<div
		className={[
			'inline-flex items-center justify-center',
			'w-[50px] h-[20px] rounded-[10px] bg-[#EFEBE6]',
			'gap-[7px]',
			'font-baron lowercase',
			className,
		].join(' ')}
	>
		{/* Минус (слева) */}
		<button
			type='button'
			onClick={onDec}
			aria-label='Уменьшить'
			title='Уменьшить'
			className='relative w-[7.58px] h-[7.58px] flex items-center justify-center cursor-pointer'
		>
			<span className='absolute top-1/2 -translate-y-1/2 w-[7.58px] h-[1.08px] bg-[#625A51]' />
		</button>

		{/* Значение */}
		<span className='text-[10px] leading-none text-black'>{value}</span>

		{/* Плюс (справа) */}
		<button
			type='button'
			onClick={onInc}
			aria-label='Увеличить'
			title='Увеличить'
			className='relative w-[7.58px] h-[7.58px] flex items-center justify-center cursor-pointer'
		>
			{/* горизонтальная черта */}
			<span className='absolute top-1/2 -translate-y-1/2 w-[7.58px] h-[1.08px] bg-[#625A51]' />
			{/* вертикальная черта */}
			<span className='absolute left-1/2 -translate-x-1/2 h-[7.58px] w-[1.08px] bg-[#625A51]' />
		</button>
	</div>
)

export default memo(Qty)
