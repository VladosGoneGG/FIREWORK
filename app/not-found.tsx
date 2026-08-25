import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="flex flex-col items-center gap-3 py-20 text-center">
			<h1 className="font-baron text-2xl text-[#333]">404</h1>
			<p className="font-baron text-sm text-[#625a51]">страница не найдена</p>
			<Link href="/" className="btn-firework mt-2 inline-flex items-center justify-center">
				на главную
			</Link>
		</div>
	)
}
