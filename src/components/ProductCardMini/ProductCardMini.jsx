// src/components/ProductCardMini/ProductCardMini.jsx
import { memo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice'
import { fmtPrice, fmtSecFull, renderSec } from '../../utils/format'
import AddToCartButton from './parts/AddToCartButton'
import PriceBlock from './parts/PriceBlock'
import ProductMeta from './parts/ProductMeta'
import ProductThumb from './parts/ProductThumb'

function ProductCardMini({ product, onSelect }) {
	const dispatch = useDispatch()

	const {
		name,
		manufacturer,
		images = [],
		shots,
		caliber,
		durationSec,
		effectsCount,
		price,
		discountPrice,
		stock,
	} = product

	const img = images[0]
	const outOfStock = Number(stock) === 0

	const handleSelect = useCallback(() => {
		onSelect?.(product)
	}, [onSelect, product])

	const onKey = useCallback(
		e => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				onSelect?.(product)
			}
		},
		[onSelect, product]
	)

	// «Цена за единицу» с учётом акции
	const unitPrice =
		typeof discountPrice === 'number' ? discountPrice : price || 0

	const add = useCallback(
		e => {
			e.stopPropagation()
			if (outOfStock) return
			// Кладём unitPrice в payload — корзина и UI будут точно использовать скидочную цену
			dispatch(addItem({ ...product, unitPrice }))
		},
		[dispatch, outOfStock, product, unitPrice]
	)

	return (
		<article
			role='button'
			tabIndex={0}
			aria-label={`Открыть товар: ${name}`}
			onClick={handleSelect}
			onKeyDown={onKey}
			title={name}
			className='w-[120px] h-[206px] bg-white'
		>
			<div className='h-full w-full flex flex-col lowercase font-baron'>
				{/* Фото 100×100 */}
				<ProductThumb
					src={img}
					alt={name}
					outOfStock={outOfStock}
					badgeText='Нет в наличии'
				/>

				{/* Название + производитель */}
				<ProductMeta name={name} manufacturer={manufacturer} />

				{/* Параметры */}
				<div className='flex text-[12px] justify-evenly'>
					<div className='flex flex-col'>
						<PriceBlock.Param icon='shots'>{shots ?? '—'}</PriceBlock.Param>
						<PriceBlock.Param icon='time' title={fmtSecFull(durationSec)}>
							{renderSec(durationSec)}
						</PriceBlock.Param>
					</div>
					<div className='flex flex-col'>
						<PriceBlock.Param icon='caliber'>{caliber ?? '—'}</PriceBlock.Param>
						<PriceBlock.Param icon='effects'>
							{effectsCount ?? '—'}
						</PriceBlock.Param>
					</div>
				</div>

				{/* Цена + кнопка */}
				<div className='mt-auto flex items-end justify-between'>
					<PriceBlock
						price={price}
						discountPrice={discountPrice}
						fmtPrice={fmtPrice}
					/>
					<AddToCartButton disabled={outOfStock} onClick={add} />
				</div>
			</div>
		</article>
	)
}

export default memo(ProductCardMini)
