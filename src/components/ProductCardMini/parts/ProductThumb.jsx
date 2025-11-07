// src/components/ProductCardMini/parts/ProductThumb.jsx

export default function ProductThumb({
	src,
	alt,
	outOfStock,
	badgeText = 'Нет в наличии',
}) {
	return (
		<div className='w-[100px] h-[100px] rounded-[10px] overflow-hidden relative'>
			{src ? (
				<img
					src={src}
					alt={alt}
					loading='lazy'
					className='w-full h-full object-cover cursor-pointer'
				/>
			) : (
				<div className='grid place-items-center w-full h-full text-xs opacity-60'>
					Нет фото
				</div>
			)}
			{outOfStock && (
				<div className='absolute left-1 top-1 px-1.5 py-[1px] rounded-[6px] text-[9px] bg-black/60 text-white'>
					{badgeText}
				</div>
			)}
		</div>
	)
}
