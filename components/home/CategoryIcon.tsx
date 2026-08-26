import Image from 'next/image'

// Maps a category's fixture id (0-8, see content/categories.ts) to its
// original hand-authored SVG icon — order/mapping confirmed against
// CategoryRow.jsx's ICONS array in the pre-migration app.
const ICON_BY_ID: Record<number, string> = {
	0: '/SVG/icon-all1.svg',
	1: '/SVG/icon-sal2.svg',
	2: '/SVG/icon-rim3.svg',
	3: '/SVG/icon-fon4.svg',
	4: '/SVG/icon-pet5.svg',
	5: '/SVG/icon-ver6.svg',
	6: '/SVG/icon-hlop7.svg',
	7: '/SVG/icon-ben8.svg',
	8: '/SVG/icon-rak9.svg',
}

export default function CategoryIcon({ categoryId, active }: { categoryId: number; active: boolean }) {
	const src = ICON_BY_ID[categoryId]
	if (!src) return null
	return (
		<Image
			src={src}
			alt=""
			aria-hidden
			width={30}
			height={30}
			className={active ? 'opacity-100' : 'opacity-80'}
		/>
	)
}
