// src/components/SubcategoryOverlay/parts/FilterSection.jsx
import WhiteCheckRow from './WhiteCheckRow'

const FilterSection = ({
	title,
	options = [],
	checkedValues = [],
	onToggle,
	normalize = false,
}) => {
	const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
	const normalizeString = str => String(str ?? '').trim().toLowerCase().replaceAll('ё', 'е')

	const checkedSet = normalize
		? new Set(toArr(checkedValues).map(normalizeString))
		: new Set(toArr(checkedValues))

	return (
		<div className='flex flex-col gap-2'>
			<div className='text-[#625A51] text-base font-baron'>{title}</div>
			<div className='flex flex-col gap-1'>
				{options.map(option => {
					const value = normalize ? normalizeString(option) : option
					const checked = checkedSet.has(value)
					return (
						<WhiteCheckRow
							key={option}
							label={String(option)}
							checked={checked}
							onToggle={() => onToggle?.(option)}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default FilterSection

