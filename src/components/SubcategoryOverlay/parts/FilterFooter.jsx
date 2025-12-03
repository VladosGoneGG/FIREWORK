// src/components/SubcategoryOverlay/parts/FilterFooter.jsx
import { useDispatch } from 'react-redux'
import { applyNow, resetForm } from '../../../store/slices/filtersSlice'

const FilterFooter = ({ previewCount, onApply, onReset, variant = 'standalone' }) => {
	const dispatch = useDispatch()

	const handleReset = () => {
		dispatch(resetForm())
		onReset?.()
	}

	const handleApply = () => {
		dispatch(applyNow())
		onApply?.()
	}

	if (variant === 'mobile') {
		return (
			<div className='self-stretch flex flex-col items-center gap-2.5 px-2.5'>
				<div className='text-center text-zinc-300 text-[12px] font-baron'>
					найдено {previewCount} товар(ов)
				</div>

				<div className='w-[272px] inline-flex items-start gap-2.5'>
					<button
						type='button'
						onClick={handleReset}
						className='w-[130px] h-[30px] pb-0.5 bg-[#EFEBE6] rounded-[10px] text-black text-[14px] font-baron cursor-pointer hover:text-[#BD52E9] flex justify-center items-center'
					>
						сбросить все
					</button>

					<button
						type='button'
						onClick={handleApply}
						className='relative w-[130px] h-[30px] pb-0.5 rounded-[10px] text-white text-[14px] font-baron bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)] overflow-hidden cursor-pointer flex justify-center items-center group'
					>
						<span className='relative z-10'>показать</span>
						<span className='absolute inset-0 rounded-[10px] bg-[#BD52E9] opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100' />
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className='px-2.5 pb-3 pt-2'>
			<div className='text-center text-zinc-300 text-[12px] font-baron'>
				найден {previewCount} товар
			</div>
			<div className='flex gap-2 mt-2'>
				<button
					type='button'
					onClick={handleReset}
					className='w-1/2 h-[25px] px-[5px] py-[4px] bg-[#EFEBE6] rounded-[10px] text-[10px] font-baron cursor-pointer hover:text-[#BD52E9]'
				>
					сбросить все
				</button>
				<button
					type='button'
					onClick={handleApply}
					className='relative w-1/2 h-[25px] cursor-pointer px-[5px] py-[4px] rounded-[10px] text-white text-[10px] font-baron bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)] overflow-hidden'
				>
					<span className='relative z-10'>показать</span>
					<span className='absolute inset-0 rounded-[10px] bg-[#BD52E9] opacity-0 transition-opacity duration-300 hover:opacity-100' />
				</button>
			</div>
		</div>
	)
}

export default FilterFooter

