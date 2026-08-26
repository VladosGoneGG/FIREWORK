'use client'

import { useRef } from 'react'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const snap = (v: number, step: number, min: number) => Math.round((v - min) / step) * step + min

const TRACK_W = 204

// Pointer-drag dual-range slider (price / duration) — ported from the
// original's RangeDual.jsx. CSS transitions on left/width (.12s ease), not
// motion — matches the original's own implementation choice there.
export default function RangeDual({
	min = 0,
	max = 20000,
	step = 10,
	valueMin,
	valueMax,
	onChange,
}: {
	min?: number
	max?: number
	step?: number
	valueMin: number
	valueMax: number
	onChange: (min: number, max: number) => void
}) {
	const trackRef = useRef<HTMLDivElement>(null)

	const vMin = clamp(Number.isFinite(valueMin) ? valueMin : min, min, Number.isFinite(valueMax) ? valueMax : max)
	const vMax = clamp(Number.isFinite(valueMax) ? valueMax : max, Number.isFinite(valueMin) ? valueMin : min, max)

	const range = max - min
	const pMin = ((vMin - min) / range) * 100
	const pMax = ((vMax - min) / range) * 100

	const startDrag = (thumb: 'min' | 'max', e: React.PointerEvent) => {
		e.preventDefault()
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()

		const getValFromClientX = (clientX: number) => {
			const x = clamp(clientX - rect.left, 0, rect.width)
			const raw = min + (x / rect.width) * range
			return clamp(snap(raw, step, min), min, max)
		}

		const move = (clientX: number) => {
			const val = getValFromClientX(clientX)
			if (thumb === 'min') onChange(Math.min(val, vMax), vMax)
			else onChange(vMin, Math.max(val, vMin))
		}

		const onPointerMove = (ev: PointerEvent) => move(ev.clientX)
		const onPointerUp = () => {
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', onPointerUp)
		}
		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerUp)
	}

	const clickOnTrack = (e: React.PointerEvent) => {
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()
		const x = clamp(e.clientX - rect.left, 0, rect.width)
		const raw = min + (x / rect.width) * range
		const val = clamp(snap(raw, step, min), min, max)
		const distToMin = Math.abs(val - vMin)
		const distToMax = Math.abs(val - vMax)
		if (distToMin <= distToMax) onChange(Math.min(val, vMax), vMax)
		else onChange(vMin, Math.max(val, vMin))
	}

	return (
		<div className="relative mt-2 w-full pl-[6px]">
			<div
				ref={trackRef}
				className="relative flex h-[16px] items-center justify-center select-none"
				style={{ width: TRACK_W }}
				onPointerDown={e => {
					if (!(e.target as HTMLElement).dataset.thumb) clickOnTrack(e)
				}}
			>
				<div className="absolute top-1/2 h-[2px] w-full -translate-y-1/2 rounded-[20px] bg-purple-500" />
				<div
					className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-[20px] bg-violet-300 transition-[left,width] duration-[120ms] ease-linear"
					style={{ left: `${pMin}%`, width: `${Math.max(0, pMax - pMin)}%` }}
				/>
				<button
					type="button"
					data-thumb="min"
					aria-label="Минимум"
					className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-[#BF53EA] shadow-sm transition-[left] duration-[120ms] ease-linear"
					style={{ left: `${pMin}%` }}
					onPointerDown={e => startDrag('min', e)}
				/>
				<button
					type="button"
					data-thumb="max"
					aria-label="Максимум"
					className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-[#BF53EA] shadow-sm transition-[left] duration-[120ms] ease-linear"
					style={{ left: `${pMax}%` }}
					onPointerDown={e => startDrag('max', e)}
				/>
			</div>
		</div>
	)
}
