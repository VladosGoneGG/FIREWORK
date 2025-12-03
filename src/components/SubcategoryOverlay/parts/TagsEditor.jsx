// src/components/SubcategoryOverlay/parts/TagsEditor.jsx
import { useCallback, useMemo, useRef, useState } from 'react'

const TagsEditor = ({ value = [], onChange }) => {
	const [input, setInput] = useState('')
	const boxRef = useRef(null)
	const inputRef = useRef(null)

	const items = useMemo(() => (Array.isArray(value) ? value : []), [value])

	const toNorm = useCallback(
		t =>
			String(t ?? '')
				.trim()
				.toLowerCase()
				.replaceAll('ё', 'е'),
		[]
	)

	const parseTokens = useCallback(
		s => {
			const parts = String(s)
				.split(/[,\n\r;]+/g)
				.map(toNorm)
				.filter(Boolean)
			const uniq = []
			const seen = new Set()
			for (const p of parts) {
				if (!seen.has(p)) {
					seen.add(p)
					uniq.push(p)
				}
			}
			return uniq
		},
		[toNorm]
	)

	const commit = useCallback(
		raw => {
			const tokens = parseTokens(raw)
			if (!tokens.length) return
			const base = Array.isArray(value) ? value : []
			const seen = new Set(base.map(toNorm))
			const merged = [...base]
			for (const tk of tokens)
				if (!seen.has(tk)) {
					seen.add(tk)
					merged.push(tk)
				}
			onChange?.(merged)
			setInput('')
			requestAnimationFrame(() => inputRef.current?.focus())
		},
		[value, onChange, parseTokens, toNorm]
	)

	const remove = useCallback(
		tag => {
			const next = (value || []).filter(x => toNorm(x) !== toNorm(tag))
			onChange?.(next)
			requestAnimationFrame(() => inputRef.current?.focus())
		},
		[value, onChange, toNorm]
	)

	const onKeyDown = e => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			commit(input)
		} else if (e.key === 'Backspace' && input === '' && items.length) {
			e.preventDefault()
			remove(items[items.length - 1])
		}
	}

	const onPaste = e => {
		const txt = (e.clipboardData || window.clipboardData)?.getData('text') || ''
		if (!txt) return
		e.preventDefault()
		commit((input + ',' + txt).replace(/,+/g, ','))
	}

	const onBlur = () => {
		if (input.trim()) commit(input)
	}

	return (
		<div
			ref={boxRef}
			className='w-[232px] min-h-[55px]   py-1 pl-1 bg-transparent rounded-[10px] 
                 text-[10px] font-baron text-black 
                 inline-flex flex-wrap items-start gap-[5px] content-start'
			onClick={() => inputRef.current?.focus()}
			role='group'
			aria-label='Редактор тегов'
		>
			{items.map(tag => (
				<div
					key={tag}
					className='h-5 px-1.5 bg-violet-300 rounded-[10px] 
                     flex justify-center items-center gap-[5px]'
				>
					<div className='text-Black text-[10px] font-baron'>{tag}</div>
					<button
						type='button'
						aria-label='Удалить тег'
						onClick={() => remove(tag)}
						className='w-2.5 h-2.5 grid place-items-center rounded hover:bg-black/10'
					>
						<svg width='10' height='10' viewBox='0 0 20 20' fill='none'>
							<path
								d='M14.0625 5.9375L5.9375 14.0625M5.9375 5.9375L14.0625 14.0625'
								stroke='black'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
				</div>
			))}

			<input
				ref={inputRef}
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyDown={onKeyDown}
				onPaste={onPaste}
				onBlur={onBlur}
				placeholder={items.length ? '' : 'теги'}
				className='flex-1 min-w-[80px] h-5 bg-transparent outline-none 
                   text-[10px] font-baron placeholder:text-[#625A51]/60'
			/>
		</div>
	)
}

export default TagsEditor

