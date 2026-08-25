import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import CartDrawer from '@/components/cart/CartDrawer'
import { CartProvider } from '@/components/cart/CartProvider'
import SiteHeader from '@/components/layout/SiteHeader'
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

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="ru" className={baronNeue.variable}>
			<body>
				<CartProvider>
					<SiteHeader />
					<main className="mx-auto max-w-[1240px] px-4 py-5">{children}</main>
					<CartDrawer />
				</CartProvider>
			</body>
		</html>
	)
}
