'use client'

import Image from 'next/image'
import { useState } from 'react'

// Still a plain GET form — submitting it just navigates to "/?q=...",
// which app/page.tsx reads from searchParams server-side. The 'use client'
// boundary exists only for the decorative placeholder's fade-on-focus/type,
// not for the search behavior itself (no debounce, no live suggestions —
// deliberately out of scope, see the parity plan's "chrome only" decision).
export default function SearchForm({ defaultValue }: { defaultValue?: string }) {
	const [value, setValue] = useState(defaultValue ?? '')
	const [focused, setFocused] = useState(false)

	return (
		<form action="/" method="get" role="search" className="group relative flex h-[50px] w-full max-w-[665px] items-center rounded-[20px] border border-[#efebe6] bg-white">
			<label htmlFor="catalogue-search" className="sr-only">
				Поиск по товарам
			</label>
			<Image
				src="/SVG/loop.svg"
				alt=""
				aria-hidden
				width={20}
				height={20}
				className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
			/>
			<input
				id="catalogue-search"
				type="search"
				name="q"
				value={value}
				onChange={e => setValue(e.target.value)}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				placeholder=" "
				className="h-full w-full cursor-text rounded-[20px] bg-transparent py-0 pr-4 pl-12 text-sm outline-none hover:bg-[#efebe6]"
			/>
			<Image
				src="/SVG/forwadding.svg"
				alt=""
				aria-hidden
				width={140}
				height={20}
				className={`pointer-events-none absolute top-1/2 left-12 hidden h-5 w-auto -translate-y-1/2 transition-opacity duration-150 lg:block ${
					value || focused ? 'opacity-0' : 'opacity-100'
				}`}
			/>
		</form>
	)
}
