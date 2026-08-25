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
						className={`block rounded-xl px-3 py-2 transition ${
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
								className={`block rounded-xl px-3 py-2 transition ${
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
