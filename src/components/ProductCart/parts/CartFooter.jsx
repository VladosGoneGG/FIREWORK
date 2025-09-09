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
		<div className='mt-auto px-4 pb-4 pt-3 bg-white'>
			<div className='text-center text-[8px] lowercase font-baron text-[#b4b4b4]'>
				итого
			</div>
			<div className='text-center text-[20px] font-extrabold tracking-wide'>
				{fmtPriceRub(total)}
				<span className='text-[10px] font-baron lowercase relative right-1.5 top-0.5'>
					руб.
				</span>
			</div>

			<div className='mt-1 text-center text-[10px] text-[#777] font-baron'>
				минимальный заказ от: {fmtPriceRub(minOrder)}
				<span className='text-[9px] ml-1 lowercase'>руб.</span>
			</div>

			<button
				type='button'
				onClick={handleClick}
				disabled={!enough}
				className={[
					'w-full mt-3 h-[44px] rounded-[12px] text-[15px] font-baron lowercase transition-colors cursor-pointer',
					enough
						? 'bg-[#a643d3] text-white hover:bg-[#c054eb] active:text-[#997DF5] active:bg-[#efebe7]'
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
