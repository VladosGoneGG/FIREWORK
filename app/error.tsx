'use client' // error.tsx must be a Client Component — Next.js requirement

import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="flex flex-col items-center gap-3 py-20 text-center">
			<h1 className="font-baron text-2xl text-[#333]">что-то пошло не так</h1>
			<p className="font-baron text-sm text-[#625a51]">
				попробуйте обновить страницу
			</p>
			<button
				type="button"
				onClick={reset}
				className="btn-firework mt-2 inline-flex items-center justify-center"
			>
				повторить
			</button>
		</div>
	)
}
