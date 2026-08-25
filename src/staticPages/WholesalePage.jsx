import HeaderMobile from '../components/LayoutMobile/parts/HeaderMobile'

export default function WholesalePage() {
	return (
		<div
			className='w-full min-h-[100svh] bg-white flex items-center justify-center
                 max-[1040px]:flex-col max-[1040px]:min-h-[100dvh]'
		>
			{/* Мобильный хедер — только ≤1040px */}
			<div className='hidden max-[1040px]:block w-full'>
				<HeaderMobile />
			</div>

			{/* Обёртка контента */}
			<div className='w-full flex items-center justify-center max-[1040px]:flex-1 max-[1040px]:min-h-[calc(100dvh-56px)] max-[1040px]:px-4'>
				{/* Карточка */}
				<div
					className='relative bg-white overflow-hidden
                     w-[393px] h-[852px] max-w-full max-h-[100svh]
                     max-[1040px]:max-h-[calc(100dvh-56px)]'
				>
					{/* Центрируем содержимое без абсолютов: одна колонка */}
					<div className='absolute inset-0 flex flex-col items-center justify-center  px-4'>
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
								// ⬇️ критично: синхронизируем переменные с реальным радиусом и inset
								'[--btn-r:20px] [--skin-inset:1px]',
								// опционально сгладить края на некоторых WebKit
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
		</div>
	)
}
