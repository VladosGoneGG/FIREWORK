// src/components/SubcategoryOverlay/SubcategoryOverlay.jsx

const Row = ({ children }) => (
	<div className='px-[18px] py-2'>
		{children}
		<div className='w-[208px] h-0.5 bg-stone-200 rounded-[20px] mt-2' />
	</div>
)

export default function SubcategoryOverlay({
	isOpen,
	onApply,
	onReset,
	onClose,
	resultsCount = 0,
}) {
	return (
		<div
			className={[
				'absolute left-0 top-0 w-full h-full',
				'transform-gpu will-change-transform transition-transform duration-300',
				isOpen
					? 'translate-y-0 opacity-100 pointer-events-auto'
					: '-translate-y-[105%] opacity-0 pointer-events-none',
				'z-0',
			].join(' ')}
			aria-hidden={!isOpen}
		>
			{/* Каркас панели */}
			<div className='w-[240px] h-[834px] bg-white rounded-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.20)] overflow-hidden flex flex-col'>
				{/* Заголовок */}
				<div className='px-5 pt-4 pb-2'>
					<div className='text-stone-600 text-lg font-baron'>фильтры</div>
					<div className='w-[208px] h-0.5 bg-stone-200 rounded-[20px] mt-2' />
				</div>

				{/* Контент (скролл) */}
				<div className='flex-1 overflow-y-auto'>
					{/* Пример блоков-фильтров (моки, легко заменить на реальные данные) */}
					<Row>
						<div className='text-black text-xs font-baron mb-2'>Цена</div>
						<div className='grid grid-cols-2 gap-2'>
							<input
								placeholder='от'
								className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400'
							/>
							<input
								placeholder='до'
								className='w-full h-9 px-2.5 bg-stone-200 rounded-[10px] text-xs font-baron placeholder-zinc-400'
							/>
						</div>
					</Row>

					<Row>
						<div className='text-black text-xs font-baron mb-2'>тип товара</div>
						<div className='flex flex-wrap gap-2'>
							{['дым', 'наземный фейерверк', 'петарды'].map(tag => (
								<button
									key={tag}
									type='button'
									className='h-5 px-1.5 bg-violet-300 rounded-[10px] text-[8px] font-baron'
								>
									{tag}
								</button>
							))}
						</div>
					</Row>

					{/* Добавь ещё блоки по макету здесь... */}
				</div>

				{/* Подвал панели */}
				<div className='px-2.5 pb-3 pt-2'>
					<div className='text-center text-zinc-300 text-[8px] font-baron'>
						найдено {resultsCount} товар(ов)
					</div>
					<div className='flex gap-2 mt-2'>
						<button
							type='button'
							onClick={onReset}
							className='w-1/2 h-6 px-[5px] py-1 bg-stone-200 rounded-[10px] text-[10px] font-baron'
						>
							сбросить все
						</button>
						<button
							type='button'
							onClick={onApply}
							className='w-1/2 h-6 px-[5px] py-1 rounded-[10px] text-white text-[10px] font-baron
                         bg-firework-radial hover:bg-firework-hover active:bg-firework-active transition-colors'
						>
							показать
						</button>
					</div>

					{/* крестик закрытия (опционально) */}
					<button
						type='button'
						onClick={onClose}
						className='absolute top-2 right-2 w-6 h-6 grid place-items-center rounded hover:bg-black/5'
						aria-label='Закрыть'
						title='Закрыть'
					>
						×
					</button>
				</div>
			</div>
		</div>
	)
}
