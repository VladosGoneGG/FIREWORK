// src/components/ui/NoPhoto.jsx
// Единый стиль плейсхолдера "Нет фото" — переиспользуется везде,
// где у товара может отсутствовать изображение.
export default function NoPhoto({ className = '' }) {
	return (
		<span
			className={[
				'flex flex-col items-center gap-1 text-[#625A51] opacity-60',
				className,
			].join(' ')}
		>
			<svg
				width='28'
				height='28'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				aria-hidden='true'
			>
				<rect x='3' y='4' width='18' height='16' rx='2' />
				<circle cx='8.5' cy='9.5' r='1.5' />
				<path d='M21 15l-5-5-4 4-3-3-6 6' />
			</svg>
			<span className='font-baron text-xs'>Нет фото</span>
		</span>
	)
}
