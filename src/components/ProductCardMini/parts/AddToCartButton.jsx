import { memo } from 'react'
import { PlusSvg } from '../../PlusSvg/PlusSvg'

function AddToCartButton({ disabled, onClick }) {
	if (disabled) return null

	return (
		<button
			type='button'
			onClick={onClick}
			className={[
				// фикс выравнивания и центрирования
				'inline-flex items-center justify-center align-middle',
				// твои размеры и остальное
				'w-[40px] h-[25px] rounded-[10px] text-[20px] leading-none transition cursor-pointer group',
				'bg-[#cbb7ff] hover:bg-purple-500 active:bg-stone-200 active:scale-95',
			].join(' ')}
			title='Добавить в корзину'
			aria-label='Добавить в корзину'
		>
			<PlusSvg className='block w-3 h-3 transition-colors text-black group-hover:text-white group-active:text-stone-600' />
		</button>
	)
}

export default memo(AddToCartButton)
