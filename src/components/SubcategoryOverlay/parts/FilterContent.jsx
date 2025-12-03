// src/components/SubcategoryOverlay/parts/FilterContent.jsx
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setField as setFieldAction } from '../../../store/slices/filtersSlice'
import { normalizeString } from '../../../utils/normalize'
import BadgeInput from './BadgeInput'
import Divider from './Divider'
import FilterSection from './FilterSection'
import PriceFilterSection from './PriceFilterSection'
import RangeDual from './RangeDual'
import TagsEditor from './TagsEditor'
import TimeFilterSection from './TimeFilterSection'
import WhiteCheckRow from './WhiteCheckRow'

const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
const nnum = v => (Number.isFinite(Number(v)) ? Number(v) : 0)

const FilterContent = ({
	form,
	filterOptions,
	variant = 'standalone',
}) => {
	const dispatch = useDispatch()

	const setField = useCallback(
		(path, value) => dispatch(setFieldAction({ path, value })),
		[dispatch]
	)

	const toggleArr = useCallback(
		(field, val) => {
			const arr = toArr(form?.[field])
			const next = arr.includes(val)
				? arr.filter(x => x !== val)
				: [...arr, val]
			setField(field, next)
		},
		[form, setField]
	)

	const onPriceChange = useCallback(
		(lo, hi) => {
			setField('price.min', Math.max(0, Math.floor(lo)))
			setField('price.max', Math.max(0, Math.floor(hi)))
		},
		[setField]
	)

	const onTimeChange = useCallback(
		(lo, hi) => {
			setField('time.min', Math.max(0, Math.floor(lo)))
			setField('time.max', Math.max(0, Math.floor(hi)))
		},
		[setField]
	)

	const priceMin = nnum(form?.price?.min ?? 0)
	const priceMax = nnum(form?.price?.max ?? 20000)
	const timeMin = nnum(form?.time?.min ?? 0)
	const timeMax = nnum(form?.time?.max ?? 120)

	const isMobile = variant === 'mobile'

	if (isMobile) {
		return (
			<div className='space-y-2'>
				<TagsEditor
					value={toArr(form?.tags)}
					onChange={next => setField('tags', next)}
				/>
				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<PriceFilterSection
					priceMin={priceMin}
					priceMax={priceMax}
					onMinChange={v => setField('price.min', v === '' ? '' : Number(v))}
					onMaxChange={v => setField('price.max', v === '' ? '' : Number(v))}
					onRangeChange={onPriceChange}
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='тип товара'
					options={filterOptions.PRODUCT_TYPES}
					checkedValues={toArr(form?.types)}
					onToggle={val => toggleArr('types', val)}
					normalize
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='производитель'
					options={filterOptions.MANUFACTURERS}
					checkedValues={toArr(form?.manufacturers)}
					onToggle={val => toggleArr('manufacturers', val)}
					normalize
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='тип'
					options={filterOptions.IGNITIONS}
					checkedValues={toArr(form?.ignitionType)}
					onToggle={val => toggleArr('ignitionType', val)}
					normalize
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='хлопки'
					options={filterOptions.SHOTS_PRESETS}
					checkedValues={toArr(form?.shots)}
					onToggle={val => toggleArr('shots', val)}
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='мощность'
					options={filterOptions.POWERS}
					checkedValues={toArr(form?.power)}
					onToggle={val => toggleArr('power', val)}
					normalize
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='вид'
					options={filterOptions.VIEWS}
					checkedValues={toArr(form?.view)}
					onToggle={val => toggleArr('view', val)}
					normalize
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<FilterSection
					title='размер'
					options={filterOptions.SIZES}
					checkedValues={toArr(form?.size)}
					onToggle={val => toggleArr('size', val)}
					normalize
				/>

				<div className='self-stretch my-2 h-0.5 bg-[#EFEBE6] rounded-[20px]' />

				<TimeFilterSection
					timeMin={timeMin}
					timeMax={timeMax}
					onMinChange={v => setField('time.min', v === '' ? '' : Number(v))}
					onMaxChange={v => setField('time.max', v === '' ? '' : Number(v))}
					onRangeChange={onTimeChange}
				/>
			</div>
		)
	}

	// Desktop variant
	return (
		<div className='space-y-3'>
			<div className='mt-3'>
				<TagsEditor
					value={toArr(form?.tags)}
					onChange={next => setField('tags', next)}
				/>
			</div>
			<Divider />

			<div className='mt-3'>
				<div className='text-black text-[12px] font-baron mb-2'>Цена</div>
				<div className='mt-3 grid grid-cols-2 gap-[10px]'>
					<BadgeInput
						label='от'
						value={form?.price?.min}
						onChange={v => setField('price.min', v === '' ? '' : Number(v))}
					/>
					<BadgeInput
						label='до'
						value={form?.price?.max}
						onChange={v => setField('price.max', v === '' ? '' : Number(v))}
					/>
				</div>
				<RangeDual
					min={0}
					max={20000}
					step={10}
					valueMin={priceMin}
					valueMax={priceMax}
					onChange={onPriceChange}
					className='mx-[2px]'
				/>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>
					тип товара
				</div>
				<div className='flex flex-col'>
					{filterOptions.PRODUCT_TYPES.map(t => {
						const checked = toArr(form?.types)
							.map(normalizeString)
							.includes(normalizeString(t))
						return (
							<WhiteCheckRow
								key={t}
								label={t}
								checked={checked}
								onToggle={() => toggleArr('types', t)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>
					производитель
				</div>
				<div className='flex flex-col gap-1'>
					{filterOptions.MANUFACTURERS.map(m => {
						const checked = toArr(form?.manufacturers)
							.map(normalizeString)
							.includes(normalizeString(m))
						return (
							<WhiteCheckRow
								key={m}
								label={m}
								checked={checked}
								onToggle={() => toggleArr('manufacturers', m)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>тип</div>
				<div className='flex flex-col gap-1'>
					{filterOptions.IGNITIONS.map(t => {
						const checked = toArr(form?.ignitionType)
							.map(normalizeString)
							.includes(normalizeString(t))
						return (
							<WhiteCheckRow
								key={t}
								label={t}
								checked={checked}
								onToggle={() => toggleArr('ignitionType', t)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>
					количество хлопков
				</div>
				<div className='flex flex-col gap-1'>
					{filterOptions.SHOTS_PRESETS.map(n => {
						const checked = toArr(form?.shots).includes(n)
						return (
							<WhiteCheckRow
								key={n}
								label={String(n)}
								checked={checked}
								onToggle={() => toggleArr('shots', n)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>
					мощность
				</div>
				<div className='flex flex-col gap-1'>
					{filterOptions.POWERS.map(p => {
						const checked = toArr(form?.power)
							.map(normalizeString)
							.includes(normalizeString(p))
						return (
							<WhiteCheckRow
								key={p}
								label={p}
								checked={checked}
								onToggle={() => toggleArr('power', p)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>вид</div>
				<div className='flex flex-col gap-1'>
					{filterOptions.VIEWS.map(v => {
						const checked = toArr(form?.view)
							.map(normalizeString)
							.includes(normalizeString(v))
						return (
							<WhiteCheckRow
								key={v}
								label={v}
								checked={checked}
								onToggle={() => toggleArr('view', v)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>
					размер
				</div>
				<div className='flex flex-col gap-1'>
					{filterOptions.SIZES.map(s => {
						const checked = toArr(form?.size)
							.map(normalizeString)
							.includes(normalizeString(s))
						return (
							<WhiteCheckRow
								key={s}
								label={s}
								checked={checked}
								onToggle={() => toggleArr('size', s)}
							/>
						)
					})}
				</div>
			</div>

			<Divider />

			<div>
				<div className='text-black text-[12px] font-baron mb-2 mx-2'>
					время работы
				</div>
				<div className='mt-3 grid grid-cols-2 gap-[10px]'>
					<BadgeInput
						label='от'
						value={form?.time?.min}
						onChange={v => setField('time.min', v === '' ? '' : Number(v))}
					/>
					<BadgeInput
						label='до'
						value={form?.time?.max}
						onChange={v => setField('time.max', v === '' ? '' : Number(v))}
					/>
				</div>
				<RangeDual
					min={0}
					max={120}
					step={1}
					valueMin={timeMin}
					valueMax={timeMax}
					onChange={onTimeChange}
					className='mx-[2px]'
				/>
			</div>
		</div>
	)
}

export default FilterContent

