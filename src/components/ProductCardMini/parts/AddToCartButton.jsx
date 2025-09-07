import { memo } from 'react'
import { PlusSvg } from '../../PlusSvg/PlusSvg'

function AddToCartButton({ disabled, onClick }) {
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={disabled}
			aria-disabled={disabled}
			className={[
				'w-[40px] h-[25px] rounded-[10px] grid place-items-center',
				'text-[20px] leading-none transition cursor-pointer group',
				disabled
					? 'bg-[#e5e2de] text-[#9c9c9c] cursor-not-allowed'
					: 'bg-[#cbb7ff] hover:bg-purple-500 active:bg-stone-200 active:scale-95',
			].join(' ')}
			title={disabled ? 'Нет в наличии' : 'Добавить в корзину'}
			aria-label={disabled ? 'Нет в наличии' : 'Добавить в корзину'}
		>
			<PlusSvg
				className={[
					'w-3 h-3 transition-colors',
					disabled
						? 'text-[#9c9c9c]'
						: 'text-black group-hover:text-white group-active:text-stone-600',
				].join(' ')}
			/>
		</button>
	)
}

export default memo(AddToCartButton)
