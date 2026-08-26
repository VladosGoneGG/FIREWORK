'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

const GRADIENTS = {
	leftHover: 'linear-gradient(270deg, #efebe6 0%, #ccbefa 100%)',
	rightHover: 'linear-gradient(90deg, #efebe6 0%, #ccbefa 100%)',
	leftActive: 'linear-gradient(270deg, #efebe6 0%, #ffffff 100%)',
	rightActive: 'linear-gradient(90deg, #efebe6 0%, #ffffff 100%)',
}

// Cart line-item quantity stepper — gradient half-highlight on hover,
// animated glyph color, whileHover/whileTap scale. Ported from Qty.jsx.
export default function Qty({
	value,
	onDec,
	onInc,
}: {
	value: number
	onDec: () => void
	onInc: () => void
}) {
	const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null)
	const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null)

	const bgLeft = activeSide === 'left' ? GRADIENTS.leftActive : GRADIENTS.leftHover
	const bgRight = activeSide === 'right' ? GRADIENTS.rightActive : GRADIENTS.rightHover

	return (
		<div
			className="font-baron relative inline-flex h-[20px] w-[50px] items-center justify-center gap-[7px] overflow-hidden rounded-[10px] bg-[#EFEBE6] select-none lowercase"
			onMouseLeave={() => {
				setHoverSide(null)
				setActiveSide(null)
			}}
		>
			<motion.div
				initial={false}
				animate={{ opacity: hoverSide === 'left' ? 1 : 0 }}
				transition={{ duration: 0.18, ease: 'easeOut' }}
				className="pointer-events-none absolute top-0 left-0 h-full w-1/2 rounded-l-[10px]"
				style={{ background: bgLeft }}
			/>
			<motion.div
				initial={false}
				animate={{ opacity: hoverSide === 'right' ? 1 : 0 }}
				transition={{ duration: 0.18, ease: 'easeOut' }}
				className="pointer-events-none absolute top-0 right-0 h-full w-1/2 rounded-r-[10px]"
				style={{ background: bgRight }}
			/>

			<motion.button
				type="button"
				onClick={onDec}
				onMouseEnter={() => setHoverSide('left')}
				onMouseDown={() => setActiveSide('left')}
				onMouseUp={() => setActiveSide(null)}
				onBlur={() => setActiveSide(null)}
				whileHover={{ scale: 1.15 }}
				whileTap={{ scale: 0.92 }}
				transition={{ duration: 0.12 }}
				className="relative z-10 -mx-[6px] -my-[6px] inline-flex cursor-pointer items-center justify-center p-[6px]"
				aria-label="Уменьшить"
				title="Уменьшить"
			>
				<motion.span
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
					style={{ width: '7.58px', height: '1.08px' }}
					animate={{ backgroundColor: hoverSide === 'left' ? '#BD52E9' : '#625A51' }}
					transition={{ duration: 0.12 }}
				/>
				<span className="h-[7.58px] w-[7.58px] opacity-0" />
			</motion.button>

			<span className="z-10 text-[10px] leading-none text-black">{value}</span>

			<motion.button
				type="button"
				onClick={onInc}
				onMouseEnter={() => setHoverSide('right')}
				onMouseDown={() => setActiveSide('right')}
				onMouseUp={() => setActiveSide(null)}
				onBlur={() => setActiveSide(null)}
				whileHover={{ scale: 1.15 }}
				whileTap={{ scale: 0.92 }}
				transition={{ duration: 0.12 }}
				className="relative z-10 -mx-[6px] -my-[6px] inline-flex cursor-pointer items-center justify-center p-[6px]"
				aria-label="Увеличить"
				title="Увеличить"
			>
				<motion.span
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
					style={{ width: '7.58px', height: '1.08px' }}
					animate={{ backgroundColor: hoverSide === 'right' ? '#BD52E9' : '#625A51' }}
					transition={{ duration: 0.12 }}
				/>
				<motion.span
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1px]"
					style={{ width: '1.08px', height: '7.58px' }}
					animate={{ backgroundColor: hoverSide === 'right' ? '#BD52E9' : '#625A51' }}
					transition={{ duration: 0.12 }}
				/>
				<span className="h-[7.58px] w-[7.58px] opacity-0" />
			</motion.button>
		</div>
	)
}
