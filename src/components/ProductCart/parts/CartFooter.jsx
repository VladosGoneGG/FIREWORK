import { memo, useMemo } from 'react'
import { fmtPriceRub } from '../../../utils/format'

const CartFooter = ({ total = 0, minOrder = 0, onContinue }) => {
	const { enough, missing } = useMemo(() => {
		const miss = Math.max(0, (minOrder || 0) - (total || 0))
		return {
			enough: (total || 0) >= (minOrder || 0) && (total || 0) > 0,
			missing: miss,
		}
	}, [total, minOrder])

	const handleClick = () => {
		if (enough) onContinue?.()
	}

	return (
		<div className='mt-auto px-2 pb-2 pt-3 bg-white'>
			<div className='text-center text-[20px] font-extrabold tracking-wide'>
				<span className='text-[12px] text-[#B4B4B4]'>итого</span>{' '}
				{fmtPriceRub(total)}
				<span className='text-[10px] font-baron lowercase relative right-1.5 top-0.5'>
					руб.
				</span>
			</div>

			<div className='lowercase mt-1 text-center text-[12px] text-[#625A51] font-baron'>
				минимальный заказ от: {fmtPriceRub(minOrder)}руб.
			</div>

			<button
				type='button'
				onClick={handleClick}
				disabled={!enough}
				className={[
					'w-[275px] mt-3 h-[50px] rounded-[12px] text-[15px] font-baron lowercase transition-colors cursor-pointer',
					enough
						? 'bg-[#a643d3] text-white hover:bg-[#c054eb] active:text-[#BD52E9] active:bg-[#efebe7]'
						: 'bg-[#efebe7] text-[#bd52e9]',
				].join(' ')}
				aria-label={enough ? 'продолжить' : 'добавьте ещё'}
				title={enough ? 'продолжить' : 'добавьте ещё'}
			>
				{enough ? (
					'продолжить'
				) : (
					<>
						не хватает ещё {fmtPriceRub(missing)}
						<span className='text-[10px] ml-1'>руб.</span>
					</>
				)}
			</button>
		</div>
	)
}

export default memo(CartFooter)
