'use client'

import { useState } from 'react'

const COLOR_BASE_BG = '#EFEBE6'
const COLOR_HOVER_CENTER = 'rgba(153,125,245,0.5)'
const COLOR_ACTIVE_BORDER = '#BD52E9'
const COLOR_CHECKED_CENTER = '#BF53EA'
const COLOR_HOVER_CHECKED_CENTER = '#BD52E9'
const COLOR_HOVER_CHECKED_BORDER = 'rgba(153,125,245,0.5)'
const INNER = 7.6
const BORDER_PX = 2

// Custom checkbox chip — not a native checkbox: a ring+dot construction
// with 4 distinct color states (base/hover/checked/checked+hover) plus a
// separate mousedown "active" ring color. Ported 1:1 from the original's
// WhiteCheckRow.jsx since these exact color values are the whole point.
export default function WhiteCheckRow({
	label,
	checked,
	onToggle,
}: {
	label: string
	checked: boolean
	onToggle: () => void
}) {
	const [hover, setHover] = useState(false)
	const [active, setActive] = useState(false)

	const OUTER = INNER + 2 * BORDER_PX

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
			type="button"
			role="checkbox"
			aria-checked={checked}
			onClick={onToggle}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => {
				setHover(false)
				setActive(false)
			}}
			onMouseDown={() => setActive(true)}
			onMouseUp={() => setActive(false)}
			title={label}
			className={`font-baron flex h-5 w-full cursor-pointer items-center gap-2 rounded-[6px] bg-white px-2 text-[10px] text-black transition-colors select-none ${
				active ? 'bg-[#efece7]' : ''
			}`}
		>
			<span
				className="grid shrink-0 place-items-center rounded-full"
				style={{
					width: OUTER,
					height: OUTER,
					background: COLOR_BASE_BG,
					borderStyle: 'solid',
					borderWidth: BORDER_PX,
					borderColor: ringColor,
				}}
			>
				<span
					style={{
						width: INNER,
						height: INNER,
						background: dotColor,
						borderRadius: '50%',
						transition: 'background-color .12s ease, background .12s ease, border-color .12s ease',
					}}
				/>
			</span>
			<span className="truncate">{label}</span>
		</button>
	)
}
