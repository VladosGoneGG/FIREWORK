import WhiteCheckRow from './WhiteCheckRow'

export default function FilterSection({
	title,
	options,
	checkedValues,
	onToggle,
}: {
	title: string
	options: readonly string[]
	checkedValues: string[]
	onToggle: (value: string) => void
}) {
	const checkedSet = new Set(checkedValues)
	return (
		<div>
			<div className="font-baron mx-2 mb-2 text-[12px] text-black">{title}</div>
			<div className="flex flex-col gap-1">
				{options.map(option => (
					<WhiteCheckRow
						key={option}
						label={option}
						checked={checkedSet.has(option)}
						onToggle={() => onToggle(option)}
					/>
				))}
			</div>
		</div>
	)
}
