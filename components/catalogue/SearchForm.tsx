import Link from 'next/link'

// Plain GET form — submitting it just navigates to "/?q=...", which
// Next.js's server component at app/page.tsx reads from searchParams.
// Needs no client-side JavaScript at all.
export default function SearchForm({ defaultValue }: { defaultValue?: string }) {
	return (
		<div className="flex w-full max-w-[520px] items-center gap-2">
			<form action="/" method="get" role="search" className="flex-1">
				<label htmlFor="catalogue-search" className="sr-only">
					Поиск по товарам
				</label>
				<input
					id="catalogue-search"
					type="search"
					name="q"
					defaultValue={defaultValue}
					placeholder="Поиск по товарам"
					className="h-11 w-full rounded-2xl border border-[#efebe6] bg-white px-4 text-sm outline-none placeholder:text-[#9c9c9c] focus:border-firework-red"
				/>
			</form>
			{defaultValue && (
				<Link
					href="/"
					className="font-baron flex h-11 shrink-0 items-center rounded-xl px-3 text-xs text-[#625a51] hover:text-firework-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
				>
					сбросить
				</Link>
			)}
		</div>
	)
}
