import Link from 'next/link'
import type { SortKey } from '@/lib/sort'

// Plain links, not a <select> + client-side handler: changing sort is just
// a URL change, and Next.js's Link already makes that instant — no reason
// to reach for a client island for something two anchor tags do natively.
export default function SortLinks({
	basePath,
	searchParams,
	value,
}: {
	basePath: string
	searchParams: Record<string, string | undefined>
	value: SortKey
}) {
	const hrefFor = (sort: SortKey) => {
		const params = new URLSearchParams(
			Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
		)
		params.set('sort', sort)
		return `${basePath}?${params.toString()}`
	}

	return (
		<div className="font-baron flex gap-2 text-[11px] lowercase text-[#625a51]">
			<Link
				href={hrefFor('price-asc')}
				className={value === 'price-asc' ? 'font-medium text-firework-red' : 'hover:text-firework-red'}
			>
				дешевле сначала
			</Link>
			<span aria-hidden>·</span>
			<Link
				href={hrefFor('price-desc')}
				className={value === 'price-desc' ? 'font-medium text-firework-red' : 'hover:text-firework-red'}
			>
				дороже сначала
			</Link>
		</div>
	)
}
