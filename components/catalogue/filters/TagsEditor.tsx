'use client'

import { useRef, useState } from 'react'
import { norm } from '@/lib/filters'

function parseTokens(s: string): string[] {
	const parts = s
		.split(/[,\n\r;]+/g)
		.map(norm)
		.filter(Boolean)
	const uniq: string[] = []
	const seen = new Set<string>()
	for (const p of parts) {
		if (!seen.has(p)) {
			seen.add(p)
			uniq.push(p)
		}
	}
	return uniq
}

// Free-text tag chip editor — comma/Enter commits, Backspace-on-empty
// removes the last tag, paste splits on [,\n\r;]+ and normalizes (the
// same ё/е fold lib/filters.ts uses server-side, imported rather than
// re-derived). Ported from the original's TagsEditor.jsx.
export default function TagsEditor({
	value,
	onChange,
}: {
	value: string[]
	onChange: (next: string[]) => void
}) {
	const [input, setInput] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	const commit = (raw: string) => {
		const tokens = parseTokens(raw)
		if (!tokens.length) return
		const seen = new Set(value.map(norm))
		const merged = [...value]
		for (const tk of tokens) {
			if (!seen.has(tk)) {
				seen.add(tk)
				merged.push(tk)
			}
		}
		onChange(merged)
		setInput('')
	}

	const remove = (tag: string) => {
		onChange(value.filter(x => norm(x) !== norm(tag)))
		inputRef.current?.focus()
	}

	return (
		<div
			className="font-baron inline-flex min-h-[55px] w-[232px] flex-wrap content-start items-start gap-[5px] rounded-[10px] bg-transparent py-1 pl-1 text-[10px] text-black"
			role="group"
			aria-label="Редактор тегов"
		>
			{value.map(tag => (
				<div
					key={tag}
					className="flex h-5 items-center justify-center gap-[5px] rounded-[10px] bg-violet-300 px-1.5"
				>
					<div className="text-[10px] text-black">{tag}</div>
					<button
						type="button"
						aria-label="Удалить тег"
						onClick={() => remove(tag)}
						className="grid h-2.5 w-2.5 place-items-center rounded hover:bg-black/10"
					>
						<svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden>
							<path
								d="M14.0625 5.9375L5.9375 14.0625M5.9375 5.9375L14.0625 14.0625"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			))}
			<input
				ref={inputRef}
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ',') {
						e.preventDefault()
						commit(input)
					} else if (e.key === 'Backspace' && input === '' && value.length) {
						e.preventDefault()
						remove(value[value.length - 1])
					}
				}}
				onPaste={e => {
					const txt = e.clipboardData.getData('text')
					if (!txt) return
					e.preventDefault()
					commit((input + ',' + txt).replace(/,+/g, ','))
				}}
				onBlur={() => {
					if (input.trim()) commit(input)
				}}
				placeholder={value.length ? '' : 'теги'}
				className="h-5 min-w-[80px] flex-1 bg-transparent outline-none placeholder:text-[#625A51]/60"
			/>
		</div>
	)
}
