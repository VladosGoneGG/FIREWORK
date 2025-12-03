// src/components/SubcategoryOverlay/parts/PriceFilterSection.jsx
import BadgeInput from './BadgeInput'
import RangeDual from './RangeDual'

const PriceFilterSection = ({
	priceMin,
	priceMax,
	onMinChange,
	onMaxChange,
	onRangeChange,
	min = 0,
	max = 20000,
	step = 10,
	className = '',
}) => {
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<div className='text-[#625A51] text-sm font-baron'>Цена</div>
			<div className='inline-flex items-center gap-2.5'>
				<BadgeInput
					label='от'
					value={priceMin}
					onChange={onMinChange}
				/>
				<BadgeInput
					label='до'
					value={priceMax}
					onChange={onMaxChange}
				/>
			</div>
			<RangeDual
				min={min}
				max={max}
				step={step}
				valueMin={priceMin}
				valueMax={priceMax}
				onChange={onRangeChange}
				className='mx-[2px]'
			/>
		</div>
	)
}

export default PriceFilterSection

