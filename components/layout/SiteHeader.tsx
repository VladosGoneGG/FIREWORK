import Link from 'next/link'

// Server Component — no cart/search-modal/burger-menu yet (cart is P5;
// this is deliberately just the parts of the old Header that are pure
// content: city, tagline, legal name, logo-as-home-link).
export default function SiteHeader() {
	return (
		<header className="w-full bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
			<div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-4 py-3">
				<div className="font-baron flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#625a51]">
					<span>Нижний Новгород</span>
					<span className="text-firework-red lowercase tracking-wide">
						крупнейший магазин пиротехники
					</span>
					<span>ип федяков и.в.</span>
				</div>
				<Link href="/" className="font-baron text-xl font-bold text-[#1d0353]">
					Салюты
				</Link>
			</div>
		</header>
	)
}
