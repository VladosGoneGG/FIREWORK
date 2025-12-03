// src/components/SubcategoryOverlay/parts/RangeDual.jsx
import React, { memo, useRef } from 'react'

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const snap = (v, step, min) => Math.round((v - min) / step) * step + min

const RangeDual = memo(function RangeDual({
	min = 0,
	max = 20000,
	step = 10,
	valueMin,
	valueMax,
	onChange,
	className = '',
}) {
	const trackRef = React.useRef(null)

	const vMin = clamp(
		Number.isFinite(valueMin) ? valueMin : min,
		min,
		Number.isFinite(valueMax) ? valueMax : max
	)
	const vMax = clamp(
		Number.isFinite(valueMax) ? valueMax : max,
		Number.isFinite(valueMin) ? valueMin : min,
		max
	)

	const range = max - min
	const pMin = ((vMin - min) / range) * 100
	const pMax = ((vMax - min) / range) * 100

	const startDrag = thumb => e => {
		e.preventDefault()
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()

		const getValFromClientX = clientX => {
			const x = clamp(clientX - rect.left, 0, rect.width)
			const raw = min + (x / rect.width) * range
			return clamp(snap(raw, step, min), min, max)
		}

		const move = clientX => {
			const val = getValFromClientX(clientX)
			if (thumb === 'min') {
				onChange?.(Math.min(val, vMax), vMax)
			} else {
				onChange?.(vMin, Math.max(val, vMin))
			}
		}

		const onPointerMove = ev => move(ev.clientX)
		const onPointerUp = () => {
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', onPointerUp)
		}
		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerUp)
	}

	const clickOnTrack = e => {
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()
		const x = clamp(e.clientX - rect.left, 0, rect.width)
		const raw = min + (x / rect.width) * range
		const val = clamp(snap(raw, step, min), min, max)
		const distToMin = Math.abs(val - vMin)
		const distToMax = Math.abs(val - vMax)
		if (distToMin <= distToMax) onChange?.(Math.min(val, vMax), vMax)
		else onChange?.(vMin, Math.max(val, vMin))
	}

	const TRACK_W = 204

	return (
		<div className={['relative w-full mt-2 pl-[6px]', className].join(' ')}>
			<div
				ref={trackRef}
				className='relative h-[16px] flex items-center select-none justify-center'
				style={{ width: TRACK_W }}
				onPointerDown={e => {
					if (!e.target.dataset.thumb) clickOnTrack(e)
				}}
			>
				<div className='absolute top-1/2 -translate-y-1/2 w-full h-[2px] rounded-[20px] bg-purple-500' />

				<div
					className='absolute top-1/2 -translate-y-1/2 h-[2px] rounded-[20px] bg-violet-300'
					style={{
						left: `${pMin}%`,
						width: `${Math.max(0, pMax - pMin)}%`,
						transition: 'left .12s ease, width .12s ease',
					}}
				/>

				<button
					type='button'
					data-thumb='min'
					aria-label='Минимум'
					className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] shadow-sm cursor-pointer'
					style={{ left: `${pMin}%`, transition: 'left .12s ease' }}
					onPointerDown={startDrag('min')}
				/>
				<button
					type='button'
					data-thumb='max'
					aria-label='Максимум'
					className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#BF53EA] shadow-sm cursor-pointer'
					style={{ left: `${pMax}%`, transition: 'left .12s ease' }}
					onPointerDown={startDrag('max')}
				/>
			</div>
		</div>
	)
})

export default RangeDual

