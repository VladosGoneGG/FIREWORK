export default function FilterFooter({
	previewCount,
	onApply,
	onReset,
}: {
	previewCount: number
	onApply: () => void
	onReset: () => void
}) {
	return (
		<div className="px-2.5 pt-2 pb-3">
			<div className="font-baron text-center text-[12px] text-zinc-300">
				найден {previewCount} товар
			</div>
			<div className="mt-2 flex gap-2">
				<button
					type="button"
					onClick={onReset}
					className="font-baron h-[25px] w-1/2 cursor-pointer rounded-[10px] bg-[#EFEBE6] px-[5px] py-[4px] text-[10px] hover:text-[#BD52E9]"
				>
					сбросить все
				</button>
				<button type="button" onClick={onApply} className="btn-firework-filter h-[25px] w-1/2 px-[5px] py-[4px] text-[10px]">
					<span>показать</span>
				</button>
			</div>
		</div>
	)
}
