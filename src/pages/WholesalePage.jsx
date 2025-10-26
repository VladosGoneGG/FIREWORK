import HeaderMobile from '../components/LayoutMobile/parts/HeaderMobile'

export default function WholesalePage() {
	return (
		<div
			className='
        w-full min-h-[100svh] bg-white flex items-center justify-center
        max-[1040px]:flex-col max-[1040px]:min-h-[100dvh]
      '
		>
			{/* Мобильный хедер — только ≤1040px, на всю ширину */}
			<div className='hidden max-[1040px]:block w-full'>
				<HeaderMobile />
			</div>

			{/* Обёртка контента: на мобиле занимаем оставшуюся высоту */}
			<div className='w-full flex items-center justify-center max-[1040px]:flex-1 max-[1040px]:min-h-[calc(100dvh-56px)] max-[1040px]:px-4'>
				{/* Карточка 393×852 по центру на больших, на маленьких не вываливается */}
				<div
					className='
            relative bg-white overflow-hidden
            w-[393px] h-[852px] max-w-full max-h-[100svh]
            max-[1040px]:max-h-[calc(100dvh-56px)]
          '
				>
					{/* Икс-Прайм */}
					<div
						className='absolute left-[91px] top-[157px] text-black font-baron'
						style={{ fontSize: 35, lineHeight: '1' }}
					>
						Икс-Прайм
					</div>

					{/* Город / адрес */}
					<div
						className='absolute text-center text-[#625A51] font-baron'
						style={{ left: 119, top: 192, fontSize: 15 }}
					>
						нижний новгород
					</div>
					<div
						className='absolute text-center text-[#625A51] font-baron'
						style={{ left: 143, top: 210, fontSize: 15 }}
					>
						каховская 1а
					</div>

					{/* Заголовок прайса */}
					<div
						className='absolute text-center text-black font-baron'
						style={{ left: 99, top: 313, fontSize: 20, lineHeight: '22px' }}
					>
						Прайс лист с
						<br />
						остатками товара
					</div>

					{/* Кнопка Скачать — радальный градиент, радиус 20 */}
					<button
						type='button'
						onClick={() => {
							/* ... */
						}}
						className='
    absolute btn-firework
    inline-flex items-center justify-center
    rounded-[20px] select-none cursor-pointer
  '
						style={{
							left: 72,
							top: 391,
							width: 250,
							height: 70,
							padding: '21px 67px',
						}}
					>
						<span className='relative z-[1] font-baron text-white text-[20px] leading-none'>
							Скачать
						</span>
					</button>

					{/* Дата обновления */}
					<div
						className='absolute text-center text-[#625A51] font-baron'
						style={{ left: 150, top: 499, fontSize: 12, lineHeight: '14px' }}
					>
						обновлено:
						<br />
						16.06.2025 в 17:00
					</div>
				</div>
			</div>
		</div>
	)
}
