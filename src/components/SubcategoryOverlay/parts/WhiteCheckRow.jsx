// src/components/SubcategoryOverlay/parts/WhiteCheckRow.jsx
import React from 'react'

const COLOR_BASE_BG = '#EFEBE6'
const COLOR_HOVER_CENTER = 'rgba(153,125,245,0.5)'
const COLOR_ACTIVE_BORDER = '#BD52E9'
const COLOR_CHECKED_CENTER = '#BF53EA'
const COLOR_HOVER_CHECKED_CENTER = '#BD52E9'
const COLOR_HOVER_CHECKED_BORDER = 'rgba(153,125,245,0.5)'

const INNER = 7.6

function WhiteCheckRow({ label, checked, onToggle }) {
	const [hover, setHover] = React.useState(false)
	const [active, setActive] = React.useState(false)

	const borderPx = (checked && hover) || active ? 2 : 2
	const OUTER = INNER + 2 * borderPx

	let dotColor = COLOR_BASE_BG
	if (!checked) {
		dotColor = hover ? COLOR_HOVER_CENTER : COLOR_BASE_BG
	} else {
		dotColor = hover ? COLOR_HOVER_CHECKED_CENTER : COLOR_CHECKED_CENTER
	}

	let ringColor = 'transparent'
	if (checked && hover) ringColor = COLOR_HOVER_CHECKED_BORDER
	if (active) ringColor = COLOR_ACTIVE_BORDER

	return (
		<button
			type='button'
			role='checkbox'
			aria-checked={checked}
			onClick={onToggle}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => {
				setHover(false)
				setActive(false)
			}}
			onMouseDown={() => setActive(true)}
			onMouseUp={() => setActive(false)}
			className={[
				'w-full h-5 px-2 bg-white rounded-[6px]',
				'flex items-center gap-2 text-[10px] font-baron text-black',
				'transition-colors select-none cursor-pointer',
				active ? 'bg-[#efece7]' : '',
			].join(' ')}
			title={label}
		>
			<span
				className='shrink-0 grid place-items-center rounded-full'
				style={{
					width: OUTER,
					height: OUTER,
					background: COLOR_BASE_BG,
					borderStyle: 'solid',
					borderWidth: borderPx,
					borderColor: ringColor,
				}}
			>
				<span
					style={{
						width: INNER,
						height: INNER,
						background: dotColor,
						borderRadius: '50%',
						transition:
							'background-color .12s ease, background .12s ease, border-color .12s ease',
					}}
				/>
			</span>

			<span className='truncate'>{label}</span>
		</button>
	)
}

export default WhiteCheckRow

