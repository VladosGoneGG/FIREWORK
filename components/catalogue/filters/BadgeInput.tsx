export default function BadgeInput({
	label,
	value,
	onChange,
}: {
	label: string
	value: number | ''
	onChange: (value: number | '') => void
}) {
	return (
		<div className="font-baron inline-flex h-[35px] w-[105px] items-center gap-[5px] rounded-[10px] bg-[#EFEBE6] px-[10px] py-[12px]">
			<div className="text-[8px] text-[#B4B4B4]">{label}</div>
			<input
				type="number"
				value={value}
				onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
				className="flex-1 bg-transparent text-[12px] text-black outline-none"
			/>
		</div>
	)
}
