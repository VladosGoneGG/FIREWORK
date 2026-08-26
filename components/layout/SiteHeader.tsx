import Link from 'next/link'
import SearchForm from '@/components/catalogue/SearchForm'
import { getCategories } from '@/lib/catalogue'
import BurgerDrawer from './BurgerDrawer'
import HeaderMobile from './HeaderMobile'

// Two full trees rendered together, gated by CSS at the original's exact
// 1040px cutoff (min-[1041px]:/max-[1040px]: arbitrary variants) rather
// than a ported useMediaQuery: avoids the SSR/hydration mismatch a JS
// viewport check would reintroduce, while still giving mobile its own
// structurally different header (see the parity plan's architecture
// decision on this). The cart button below is the one Client Component
// leaf on the desktop tree; BurgerDrawer is the client leaf on mobile.
export default async function SiteHeader() {
	const categories = await getCategories()

	return (
		<>
			<header className="hidden min-[1041px]:mx-auto min-[1041px]:block min-[1041px]:w-[min(1240px,calc(100vw-20px))] min-[1041px]:rounded-b-[20px] min-[1041px]:bg-white min-[1041px]:shadow-[0_0_10px_0_rgba(0,0,0,0.2)]">
				<div className="py-4">
					<div className="flex select-none items-center justify-between gap-6 px-4">
						<p className="font-baron ml-[46px] text-[18px] text-[#625a51]">Нижний Новгород</p>
						<h2
							className="font-baron max-w-[60%] text-center text-xl tracking-wide text-[#bf53eb]"
							title="крупнейший магазин пиротехники"
						>
							крупнейший магазин пиротехники
						</h2>
						<div
							className="font-baron mr-[46px] max-w-[40%] text-right text-[18px] text-[#625a51]"
							title="ип федяков и.в."
						>
							ип федяков и.в.
						</div>
					</div>

					<div className="mx-auto my-4 h-[2px] w-[min(1200px,calc(100%-40px))] rounded-[20px] bg-[#efebe6]" />

					<div className="ml-[79px] flex items-center gap-15 px-4">
						<Link
							href="/"
							className="flex h-[40px] w-[120px] shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
						>
							<span className="font-baron text-[25px] text-[#bd52e9]">х-прайм</span>
						</Link>
						<div className="flex min-w-0 flex-1 items-center gap-4">
							<div className="w-full max-w-[665px]">
								<SearchForm />
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="min-[1041px]:hidden">
				<HeaderMobile categories={categories} />
			</div>
		</>
	)
}
