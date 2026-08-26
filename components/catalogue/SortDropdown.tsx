'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { SortKey } from '@/lib/sort'

const OPTIONS: { value: SortKey; label: string }[] = [
	{ value: 'price-asc', label: 'дешевле сначала' },
	{ value: 'price-desc', label: 'дороже сначала' },
]

// Custom listbox — full keyboard nav (Arrow/Enter/Escape), outside-click
// close, animated chevron — restoring the original's SortDropdown.jsx
// chrome. Still drives the same ?sort= URL param SortLinks did; this is a
// visual/interaction restore, not an architecture change.
export default function SortDropdown({
	basePath,
	searchParams,
	value,
}: {
	basePath: string
	searchParams: Record<string, string | undefined>
	value: SortKey
}) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [hoverIdx, setHoverIdx] = useState(-1)
	const rootRef = useRef<HTMLDivElement>(null)

	const current = OPTIONS.find(o => o.value === value) ?? OPTIONS[0]

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [])

	const openMenu = () => {
		setHoverIdx(Math.max(0, OPTIONS.findIndex(o => o.value === current.value)))
		setOpen(true)
	}

	const commit = (val: SortKey) => {
		setOpen(false)
		if (val === current.value) return
		const params = new URLSearchParams(
			Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
		)
		params.set('sort', val)
		router.push(`${basePath}?${params.toString()}`)
	}

	return (
		<div ref={rootRef} className="relative inline-block">
			<button
				type="button"
				onClick={() => (open ? setOpen(false) : openMenu())}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						if (open) setOpen(false)
						else openMenu()
					} else if (e.key === 'ArrowDown') {
						e.preventDefault()
						if (!open) openMenu()
						else setHoverIdx(i => Math.min(OPTIONS.length - 1, i < 0 ? 0 : i + 1))
					} else if (e.key === 'ArrowUp') {
						e.preventDefault()
						if (!open) openMenu()
						else setHoverIdx(i => Math.max(0, i < 0 ? 0 : i - 1))
					} else if (e.key === 'Escape' && open) {
						e.preventDefault()
						setOpen(false)
					}
				}}
				aria-haspopup="listbox"
				aria-expanded={open}
				className="font-baron inline-flex h-[25.5px] w-[150px] cursor-pointer items-center justify-center gap-[13px] rounded-[10px] bg-white text-[10px] text-[#625A51] ring-1 ring-inset ring-[#D9D9D9] transition-colors hover:bg-[#f7f5f3] hover:text-[#BD52E9] active:bg-[#efece7]"
			>
				<p className="truncate pb-[2px]">{current.label}</p>
				<span className="relative h-[10px] w-[10px] overflow-hidden">
					<span
						className={`absolute top-[2.08px] left-[0.83px] h-[6.24px] w-[8.33px] origin-center transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
						style={{ backgroundColor: 'currentColor', clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}
					/>
				</span>
			</button>

			{open && (
				<ul
					role="listbox"
					tabIndex={-1}
					onKeyDown={e => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							const idx = hoverIdx >= 0 ? hoverIdx : OPTIONS.findIndex(o => o.value === current.value)
							commit((OPTIONS[idx] ?? current).value)
						} else if (e.key === 'ArrowDown') {
							e.preventDefault()
							setHoverIdx(i => Math.min(OPTIONS.length - 1, i < 0 ? 0 : i + 1))
						} else if (e.key === 'ArrowUp') {
							e.preventDefault()
							setHoverIdx(i => Math.max(0, i < 0 ? 0 : i - 1))
						} else if (e.key === 'Escape') {
							e.preventDefault()
							setOpen(false)
						}
					}}
					className="scroll-hidden absolute top-full left-0 z-50 mt-1 max-h-[180px] w-[150px] overflow-auto rounded-[10px] bg-white shadow-sm ring-1 ring-inset ring-[#D9D9D9]"
				>
					{OPTIONS.map((opt, idx) => {
						const active = opt.value === current.value
						const hovered = idx === hoverIdx
						return (
							<li key={opt.value}>
								<button
									type="button"
									role="option"
									aria-selected={active}
									onMouseEnter={() => setHoverIdx(idx)}
									onClick={() => commit(opt.value)}
									className={`font-baron w-full cursor-pointer px-3 py-2 text-left text-[10px] transition-colors hover:bg-[#f7f5f3] hover:text-[#BD52E9] active:bg-[#efece7] ${
										active ? 'bg-[#f2efeb] text-black' : 'text-[#625A51]'
									} ${hovered && !active ? 'bg-[#f7f5f3] text-[#BD52E9]' : ''}`}
								>
									{opt.label}
								</button>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
