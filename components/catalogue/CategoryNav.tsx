import Link from 'next/link'
import type { Category } from '@/lib/catalogue'

export default function CategoryNav({
	categories,
	activeSlug,
}: {
	categories: Category[]
	activeSlug?: string
}) {
	return (
		<nav aria-label="Категории" className="rounded-2xl bg-white p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
			<ul className="font-baron space-y-0.5 text-sm lowercase">
				<li>
					<Link
						href="/"
						className={`flex min-h-11 items-center rounded-xl px-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red ${
							!activeSlug ? 'font-medium text-firework-red' : 'text-[#333] hover:text-firework-red'
						}`}
					>
						все
					</Link>
				</li>
				{categories
					.filter(c => c.slug !== 'all')
					.map(c => (
						<li key={c.id}>
							<Link
								href={`/category/${c.slug}`}
								className={`flex min-h-11 items-center rounded-xl px-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red ${
									activeSlug === c.slug
										? 'font-medium text-firework-red'
										: 'text-[#333] hover:text-firework-red'
								}`}
							>
								{c.name}
							</Link>
						</li>
					))}
			</ul>
		</nav>
	)
}
