import { memo, useMemo } from 'react'
import { fmtPriceRub } from '../../../utils/format'

const CartFooter = ({ total = 0, minOrder = 0, onContinue, submitting = false }) => {
	const { enough, missing } = useMemo(() => {
		const miss = Math.max(0, (minOrder || 0) - (total || 0))
		return {
			enough: (total || 0) >= (minOrder || 0) && (total || 0) > 0,
			missing: miss,
		}
	}, [total, minOrder])

	const handleClick = () => {
		if (enough && !submitting) onContinue?.()
	}

	return (
		<div
			className={[
				'mt-auto px-2.5 pb-2.5 pt-2.5 bg-white',
				// ≤1040px — центрируем контент и кнопку
				'max-[1040px]:text-center',
			].join(' ')}
		>
			<div className='text-center text-[20px] font-extrabold tracking-wide'>
				<span className='text-[12px] text-[#B4B4B4]'>итого</span>{' '}
				{fmtPriceRub(total)}
				<span className='text-[10px] font-baron lowercase relative right-1.5 top-0.5'>
					руб.
				</span>
			</div>

			<button
				type='button'
				onClick={handleClick}
				disabled={!enough || submitting}
				aria-busy={submitting}
				className={[
					'w-[275px] mt-3 h-[50px] rounded-[12px] text-[15px] font-baron lowercase transition-colors',
					'max-[1040px]:mx-auto',
					'disabled:cursor-not-allowed',
					enough
						? 'btn-firework isolate text-white' // градиент + ховер/актив из твоего CSS
						: 'bg-[#efebe7] text-[#bd52e9]', // пассивная кнопка без оверлеев
				].join(' ')}
				aria-label={submitting ? 'отправка заказа' : enough ? 'продолжить' : 'добавьте ещё'}
				title={submitting ? 'отправка заказа' : enough ? 'продолжить' : 'добавьте ещё'}
			>
				{submitting ? (
					<span className='relative z-[1]'>отправляем…</span>
				) : enough ? (
					<span className='relative z-[1]'>продолжить</span>
				) : (
					<span className='relative z-[1]'>
						не хватает ещё {fmtPriceRub(missing)}
						<span className='text-[10px] ml-1'>руб.</span>
					</span>
				)}
			</button>
		</div>
	)
}

export default memo(CartFooter)
