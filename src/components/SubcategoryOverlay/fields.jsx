// src/components/SubcategoryOverlay/fields.js
export const Row = ({ title, children }) => (
	<div className='px-[18px] py-2'>
		{title && (
			<div className='text-black text-xs font-baron mb-2 lowercase'>
				{title}
			</div>
		)}
		{children}
		<div className='w-[208px] h-0.5 bg-stone-200 rounded-[20px] mt-2' />
	</div>
)

export const Text = props => (
	<input
		{...props}
		className={
			'w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 ' +
			(props.className || '')
		}
	/>
)

export const Num = ({ value, onChange, ...rest }) => (
	<input
		inputMode='numeric'
		value={value}
		onChange={e => onChange?.(e.target.value.replace(/[^\d]/g, ''))}
		{...rest}
		className={
			'w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400 ' +
			(rest.className || '')
		}
	/>
)

export const Check = ({ label, checked, onChange }) => (
	<label className='flex items-center gap-2 text-xs font-baron'>
		<input
			type='checkbox'
			checked={checked}
			onChange={e => onChange?.(e.target.checked)}
		/>
		{label}
	</label>
)
