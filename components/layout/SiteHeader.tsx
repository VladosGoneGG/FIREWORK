import Link from 'next/link'
import CartButton from '@/components/cart/CartButton'

// Server Component — the cart button below is the one Client Component
// leaf (it needs the cart's item count); everything else here is static.
export default function SiteHeader() {
	return (
		<header className="w-full bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
			<div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-4 py-3">
				<div className="font-baron flex flex-wrap items-center justify-between gap-2 text-sm text-[#625a51]">
					<span>Нижний Новгород</span>
					<span className="text-firework-red lowercase tracking-wide">
						крупнейший магазин пиротехники
					</span>
					<span>ип федяков и.в.</span>
				</div>
				<div className="flex items-center justify-between gap-3">
					<Link
						href="/"
						className="font-baron flex min-h-11 items-center text-xl font-bold text-[#1d0353] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
					>
						Салюты
					</Link>
					<CartButton />
				</div>
			</div>
		</header>
	)
}
