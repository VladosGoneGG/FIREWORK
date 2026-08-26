import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Inter } from 'next/font/google'
import { MotionConfig } from 'motion/react'
import CartSheet from '@/components/cart/CartSheet'
import { CartProvider } from '@/components/cart/CartProvider'
import { FirstPaintProvider } from '@/components/catalogue/FirstPaintContext'
import CatalogueShell from '@/components/layout/CatalogueShell'
import SiteHeader from '@/components/layout/SiteHeader'
import { getCategories, getProducts } from '@/lib/catalogue'
import { siteUrl } from './robots'
import './globals.css'

// Brand display/body face — three weights, matching the brand's original
// @font-face declarations (400 regular, 700 bold, 900 black). Calibri
// (the fourth weight in the original brand assets) was never carried
// over — a bundled proprietary Microsoft font with no verified
// web-embedding licence (see the audit's "Licensing risk — Calibri"
// finding).
const baronNeue = localFont({
	src: [
		{ path: '../assets/fonts/BaronNeue.woff2', weight: '400', style: 'normal' },
		{ path: '../assets/fonts/BaronNeueBold.woff2', weight: '700', style: 'normal' },
		{ path: '../assets/fonts/BaronNeueBlack.woff2', weight: '900', style: 'normal' },
	],
	variable: '--font-baron-neue',
	display: 'swap',
})

// Secondary brand faces, both used live in restored components (product
// card name/meta text, footer-style labels) — carried over from the
// original's @font-face (Barlow, local TTF) and Google Fonts link (Inter).
const barlow = localFont({
	src: [
		{ path: '../assets/fonts/Barlow-Regular.ttf', weight: '400', style: 'normal' },
		{ path: '../assets/fonts/Barlow-Bold.ttf', weight: '700', style: 'normal' },
	],
	variable: '--font-barlow',
	display: 'swap',
})

const inter = Inter({
	subsets: ['latin', 'cyrillic'],
	weight: ['300', '400', '500', '600', '700'],
	variable: '--font-inter',
	display: 'swap',
})

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl()),
	title: { default: 'Салюты — крупнейший магазин пиротехники', template: '%s — Салюты' },
	twitter: { card: 'summary' },
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
}

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	// Fetched once here rather than per-page: CatalogueShell is now a
	// persistent component (see its own comment for why), so it needs this
	// data itself instead of receiving pre-built sidebar JSX from each page.
	const [categories, allProducts] = await Promise.all([getCategories(), getProducts()])
	return (
		<html lang="ru" className={`${baronNeue.variable} ${barlow.variable} ${inter.variable}`}>
			<body className="scroll-hidden flex h-screen flex-col overflow-y-auto">
				{/* Every motion-driven animation added for visual parity (nav
				    drawer, filter panel, cart sheet, qty steppers, PriceQtyButton)
				    degrades to an instant state change under the OS's
				    prefers-reduced-motion setting via this one provider, matching
				    the accessibility bar Dialog.tsx already held itself to. */}
				<MotionConfig reducedMotion="user">
					<FirstPaintProvider>
						<CartProvider>
							<SiteHeader />
							{/* min-h-0 flex-1 hands the catalogue shell exactly the
							    remaining viewport height below the header — see
							    CatalogueShell.tsx for the height-chain mechanism and
							    the route-level crossfade living inside its center slot. */}
							<div className="min-h-0 flex-1">
								<CatalogueShell categories={categories} allProducts={allProducts}>
									{children}
								</CatalogueShell>
							</div>
							<CartSheet />
						</CartProvider>
					</FirstPaintProvider>
				</MotionConfig>
			</body>
		</html>
	)
}
