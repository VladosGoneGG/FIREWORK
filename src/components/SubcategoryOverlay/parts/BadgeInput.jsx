// src/components/SubcategoryOverlay/parts/BadgeInput.jsx
function BadgeInput({ label, value, onChange }) {
	return (
		<div className='w-[105px] h-[35px] px-[10px] py-[12px] bg-[#EFEBE6] rounded-[10px] inline-flex items-center gap-[5px]'>
			<div className='text-[8px] text-[#B4B4B4] font-baron'>{label}</div>
			<input
				type='number'
				value={value ?? ''}
				onChange={e =>
					onChange?.(e.target.value === '' ? '' : Number(e.target.value))
				}
				className='flex-1 bg-transparent outline-none text-black text-[12px] font-baron'
			/>
		</div>
	)
}

export default BadgeInput

