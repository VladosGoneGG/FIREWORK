// src/components/ProductsPage/ProductStatusState.jsx
// Показывается вместо каталога, когда товары не загрузились с API
// или список пуст. Общий для десктопной и мобильной версии.
export default function ProductStatusState({ status, error, isEmpty, onRetry }) {
	if (status === 'failed') {
		return (
			<div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
				<p className='font-baron text-[14px] text-[#625a51]'>
					Не удалось загрузить товары{error ? `: ${error}` : ''}
				</p>
				<button
					type='button'
					onClick={onRetry}
					className='btn-firework-filter px-4 py-2 rounded-[10px] font-baron text-[12px] cursor-pointer'
				>
					повторить
				</button>
			</div>
		)
	}

	if (status === 'succeeded' && isEmpty) {
		return (
			<div className='py-16 text-center font-baron text-[14px] text-[#625a51]'>
				Товары не найдены
			</div>
		)
	}

	return null
}
