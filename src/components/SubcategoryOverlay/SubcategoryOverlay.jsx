// src/components/SubcategoryOverlay/SubcategoryOverlay.jsx
import { Check, Num, Row, Text } from './fields'

export default function SubcategoryOverlay({
	isOpen,
	onApply,
	onReset,
	onClose,
	resultsCount = 0,
	form,
	setField, // теперь понимает 'price.min', 'durationSec.max' и т.п.
	reset,
}) {
	return (
		<div
			className={[
				'absolute left-0 top-0 w-full h-full ',
				'transform-gpu will-change-transform transition-all duration-300',
				isOpen
					? 'translate-y-0 opacity-100 pointer-events-auto'
					: '-translate-y-[105%] opacity-0 pointer-events-none',
				'z-0',
			].join(' ')}
			aria-hidden={!isOpen}
		>
			<div className='w-[240px] h-[834px] bg-white rounded-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.20)] overflow-hidden flex flex-col'>
				<div className='px-5 pt-4 pb-2 relative'>
					<div className='text-stone-600 text-lg font-baron lowercase'>
						фильтры
					</div>
					<div className='w-[208px] h-0.5 bg-stone-200 rounded-[20px] mt-2' />
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

				<div className='flex-1 overflow-y-auto scroll-hidden'>
					<Row title='цена'>
						<div className='grid grid-cols-2 gap-2'>
							<Num
								placeholder='от'
								value={form.price.min}
								onChange={v => setField('price.min', v)}
							/>
							<Num
								placeholder='до'
								value={form.price.max}
								onChange={v => setField('price.max', v)}
							/>
						</div>
					</Row>

					<Row title='поиск по названию'>
						<Text
							placeholder='например, салют 1'
							value={form.name}
							onChange={e => setField('name', e.target.value)}
						/>
					</Row>

					<Row title='производитель'>
						<Text
							placeholder='например, piroff'
							value={form.manufacturer}
							onChange={e => setField('manufacturer', e.target.value)}
						/>
					</Row>

					<Row title='подкатегория'>
						<Text
							placeholder='например, петарды'
							value={form.subcategory}
							onChange={e => setField('subcategory', e.target.value)}
						/>
					</Row>

					<Row title='время работы (сек.)'>
						<div className='grid grid-cols-2 gap-2'>
							<Num
								placeholder='от'
								value={form.durationSec.min}
								onChange={v => setField('durationSec.min', v)}
							/>
							<Num
								placeholder='до'
								value={form.durationSec.max}
								onChange={v => setField('durationSec.max', v)}
							/>
						</div>
					</Row>

					<Row title='залпы'>
						<div className='grid grid-cols-2 gap-2'>
							<Num
								placeholder='от'
								value={form.shots.min}
								onChange={v => setField('shots.min', v)}
							/>
							<Num
								placeholder='до'
								value={form.shots.max}
								onChange={v => setField('shots.max', v)}
							/>
						</div>
					</Row>

					{/* Вариант 1: диапазон калибра */}
					<Row title='калибр (диапазон)'>
						<div className='grid grid-cols-2 gap-2'>
							<Num
								placeholder='от'
								value={form.caliber.min}
								onChange={v => setField('caliber.min', v)}
							/>
							<Num
								placeholder='до'
								value={form.caliber.max}
								onChange={v => setField('caliber.max', v)}
							/>
						</div>
					</Row>

					{/* Вариант 2: подстрока калибра (например, "1.2") */}
					<Row title='калибр (подстрока)'>
						<Text
							placeholder='например, 1.2'
							value={form.caliberText}
							onChange={e => setField('caliberText', e.target.value)}
						/>
					</Row>

					<Row title='эффекты'>
						<div className='grid grid-cols-2 gap-2'>
							<Num
								placeholder='мин'
								value={form.effectsCount.min}
								onChange={v => setField('effectsCount.min', v)}
							/>
							<Num
								placeholder='макс'
								value={form.effectsCount.max}
								onChange={v => setField('effectsCount.max', v)}
							/>
						</div>
					</Row>

					<Row title='дополнительно'>
						<div className='flex flex-col gap-1'>
							<Check
								label='есть сертификат'
								checked={form.hasCertificate}
								onChange={v => setField('hasCertificate', v)}
							/>
							<Check
								label='только в наличии'
								checked={form.inStockOnly}
								onChange={v => setField('inStockOnly', v)}
							/>
						</div>
					</Row>
				</div>

				<div className='px-2.5 pb-3 pt-2'>
					<div className='text-center text-zinc-300 text-[8px] font-baron'>
						найдено {resultsCount} товар(ов)
					</div>
					<div className='flex gap-2 mt-2'>
						<button
							type='button'
							onClick={onReset} // сброс → App сам сбросит форму и appliedFilters
							className='w-1/2 h-6 px-[5px] py-1 bg-stone-200 rounded-[10px] text-[10px] font-baron'
						>
							сбросить все
						</button>
						<button
							type='button'
							onClick={onApply} // применить → App возьмёт normalized формы и установит appliedFilters
							className='w-1/2 h-6 px-[5px] py-1 rounded-[10px] text-white text-[10px] font-baron
                 bg-firework-radial hover:bg-firework-hover active:bg-firework-active transition-colors'
						>
							показать
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
