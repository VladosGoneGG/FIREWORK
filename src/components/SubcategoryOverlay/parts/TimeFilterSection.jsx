// src/components/SubcategoryOverlay/parts/TimeFilterSection.jsx
import BadgeInput from './BadgeInput'
import RangeDual from './RangeDual'

const TimeFilterSection = ({
	timeMin,
	timeMax,
	onMinChange,
	onMaxChange,
	onRangeChange,
	min = 0,
	max = 120,
	step = 1,
	className = '',
}) => {
	return (
		<div className={`flex flex-col gap-2 mb-2 ${className}`}>
			<div className='text-[#625A51] text-sm font-baron'>время работы</div>
			<div className='inline-flex items-center gap-2.5'>
				<BadgeInput
					label='от'
					value={timeMin}
					onChange={onMinChange}
				/>
				<BadgeInput
					label='до'
					value={timeMax}
					onChange={onMaxChange}
				/>
			</div>
			<RangeDual
				min={min}
				max={max}
				step={step}
				valueMin={timeMin}
				valueMax={timeMax}
				onChange={onRangeChange}
				className='mx-[2px]'
			/>
		</div>
	)
}

export default TimeFilterSection

