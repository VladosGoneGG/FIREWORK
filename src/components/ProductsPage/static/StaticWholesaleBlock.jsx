const StaticWholesaleBlock = () => {
	return (
		<div
			className='w-full bg-white flex items-center justify-center
                 '
		>
			{/* Обёртка контента */}

			{/* Карточка */}
			<div
				className=' bg-white flex justify-center items-center
                     w-[393px] h-[852px] '
			>
				<div className='inset-0 flex flex-col items-center justify-start  px-4'>
					{/* Заголовок */}
					<div className='text-center text-black font-baron leading-[22px] text-[20px]'>
						Прайс лист с
						<br />
						остатками товара
					</div>

					{/* Кнопка — корректный радиус и размеры, легко настраивать */}
					<button
						type='button'
						onClick={() => {
							/* ... */
						}}
						className={[
							'btn-firework inline-flex items-center justify-center',
							'rounded-[20px] h-[64px] w-[183px] px-[28px] my-[38px]',
							'[--btn-r:20px] [--skin-inset:1px]',
							'bg-clip-padding',
						].join(' ')}
					>
						<span className='relative z-[1] bottom-[2px] font-baron text-white text-[20px] leading-none'>
							Скачать
						</span>
					</button>

					{/* Дата обновления */}
					<div className='text-center text-[#625A51] font-baron text-[12px] leading-[14px]'>
						обновлено:
						<br />
						16.06.2025 в 17:00
					</div>
				</div>
			</div>
		</div>
	)
}

export default StaticWholesaleBlock
