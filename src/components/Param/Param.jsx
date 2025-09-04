// src/components/Param/Param.jsx
const Param = ({ icon, children, title }) => {
	const isImg =
		typeof icon === 'string' &&
		(icon.endsWith('.svg') || icon.startsWith('data:image'))

	return (
		<div className='flex items-center gap-1 text-[12px] text-[#6b6b6b]'>
			{isImg ? (
				<img src={icon} alt='' className='w-4 h-4 shrink-0' />
			) : (
				<span className='text-[14px] shrink-0'>{icon}</span>
			)}
			{/* значение ограничиваем по ширине и обрезаем с … */}
			<span
				className='font-medium text-[#4a4a4a] min-w-0 max-w-[44px] truncate'
				title={title ?? (typeof children === 'string' ? children : undefined)}
			>
				{children}
			</span>
		</div>
	)
}

export default Param
