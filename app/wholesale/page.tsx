import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Оптовые продажи',
	description: 'Прайс-лист с остатками товара для оптовых покупателей.',
}

export default function WholesalePage() {
	return (
		<div className="mx-auto flex max-w-[480px] flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
			<h1 className="font-baron text-xl leading-snug text-[#333]">
				прайс-лист с остатками товара
			</h1>
			{/*
			  The old app had a "Скачать" button here with no file behind it
			  (onClick was an empty no-op even before this migration) — not
			  porting a decoy download. Point people at the real contact
			  channel instead until an actual price-list file exists.
			*/}
			<Link href="/contacts" className="btn-firework inline-flex items-center justify-center">
				запросить прайс-лист
			</Link>
			<p className="font-baron text-xs text-[#625a51]">обновлено: 16.06.2025 в 17:00</p>
		</div>
	)
}
