import Link from 'next/link'
import CartButton from '@/components/cart/CartButton'
import type { Category } from '@/lib/catalogue'
import BurgerDrawer from './BurgerDrawer'
import CursorSvg from './CursorSvg'

// Mobile header (<=1040px): sticky, different chrome entirely from the
// desktop tree — asymmetric corners, hours/location readout, directions
// link — plus the hamburger nav drawer. Rendered alongside (not instead
// of) the desktop tree in SiteHeader, gated by CSS breakpoint only (no
// useMediaQuery — see the plan's decision on avoiding hydration-risky JS
// viewport detection).
export default function HeaderMobile({ categories }: { categories: Category[] }) {
	return (
		<header className="sticky top-0 z-[120] flex h-[60px] w-full items-end justify-between rounded-bl-[30px] rounded-br-[10px] bg-[#efebe6] shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
			<div className="flex w-full items-end">
				<div className="ml-[10px] mb-[6px] flex w-[180px] justify-between">
					<BurgerDrawer categories={categories} />
					<Link href="/" className="flex h-[40px] w-[120px] items-center justify-center">
						<span className="font-baron text-[25px] text-[#bd52e9]">х-прайм</span>
					</Link>
				</div>
				<div className="mb-2.5 ml-auto flex items-end gap-2">
					<CartButton />
					<div className="mr-2.5 flex w-[150px] items-center justify-end gap-2.5">
						<a
							href="https://yandex.ru/maps/-/CLG7jLpF"
							target="_blank"
							rel="noopener noreferrer"
							className="pt-2"
							aria-label="Проложить маршрут"
						>
							<CursorSvg />
						</a>
						<ul className="font-baron">
							<li>
								<p className="text-[20px]">9:00 - 18:00</p>
							</li>
							<li className="relative bottom-1.5">
								<p className="text-[12px] text-[#625a51]">
									каховская <span className="uppercase">1а/с</span>
								</p>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</header>
	)
}
