// src/components/ProductCardMini/ProductCardMiniMobile.jsx
import { memo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { addItem } from '../../../store/slices/cartSlice'
import { fmtPrice, fmtSecFull, renderSec } from '../../../utils/format'
import PlusMobileSvg from '../../PlusMobileSvg/PlusMobileSvg'
import PriceBlock from '../../ProductCardMini/parts/PriceBlock'
import ProductThumb from '../../ProductCardMini/parts/ProductThumb'

function ProductCardMiniMobile({ product /*, onSelect*/ }) {
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
		pack,
		packLabel,
	} = product || {}

	const img = images?.[0]

	const num = v => {
		const n = Number(v)
		return Number.isFinite(n) ? n : null
	}

	const stockCount = num(stock)
	const outOfStock = Number.isFinite(stockCount) ? stockCount <= 0 : false

	const packCount =
		num(pack) ??
		num(product?.packQty) ??
		num(product?.inPack) ??
		num(product?.countInPack)

	const displayQty = Number.isFinite(stockCount) ? stockCount : packCount
	const badgeText = Number.isFinite(displayQty)
		? `${displayQty} шт.`
		: packLabel || null

	const handleAdd = useCallback(
		e => {
			e.stopPropagation()
			if (outOfStock) return
			dispatch(addItem(product))
		},
		[dispatch, product, outOfStock]
	)

	const currentPrice = Number(discountPrice) || Number(price) || 0
	const hasDiscount =
		Number(discountPrice) > 0 && Number(discountPrice) < Number(price)

	return (
		<div
			className={[
				'flex flex-row w-full max-w-[360px] h-[100px] justify-between rounded-[20px]',
				'shadow-[0_0_10px_rgba(0,0,0,0.2)] bg-white px-2.5',
				'select-none outline-none',
				outOfStock ? 'opacity-70' : '',
			].join(' ')}
		>
			{/* превью */}
			<div className='relative w-[100px] h-[100px] rounded-[10px] overflow-hidden shrink-0'>
				{img ? (
					<ProductThumb
						src={typeof img === 'string' ? img : img?.url || img?.src}
						alt={name || 'product'}
						className='w-full h-full object-cover'
					/>
				) : (
					<img
						src='/SVG/full-block.svg'
						alt='product'
						className='w-full h-full object-cover'
					/>
				)}

				{outOfStock && (
					<div className='absolute inset-0 bg-white/70 flex items-center justify-center text-[12px] font-medium rounded-[10px]'>
						Нет в наличии
					</div>
				)}
			</div>

			{/* контент */}
			<div className='flex flex-col justify-between w-[230px] h-[100px] pl-2'>
				{/* заголовок + бейдж */}
				<div className='flex justify-between items-start h-[27px]'>
					<ul className='max-w-[170px]'>
						<li className='leading-[14px]'>
							<p className='font-barlow text-[12px] pt-2.5 text-black line-clamp-1'>
								{name || '—'}
							</p>
						</li>
						<li className='leading-[12px] mt-[1px]'>
							<p className='font-baron text-[#625A51] text-[8px] line-clamp-1'>
								{manufacturer || '—'}
							</p>
						</li>
					</ul>

					{badgeText && (
						<div className='w-[49px] h-[22px] mt-[10px] bg-[#098d00]/70 rounded-[10px] flex justify-center items-end overflow-hidden'>
							<div className='text-white text-[17px] font-baron'>
								{Number.isFinite(stockCount) ? stockCount : packCount}
							</div>
							<div className='text-white text-[8px] mb-[2px] font-baron'>
								шт.
							</div>
						</div>
					)}
				</div>

				{/* характеристики + цена */}
				<div className='flex items-end justify-between mb-2.5 h-[60px] text-[12px] text-[#625A51] font-baron'>
					<div className='grid grid-cols-2 gap-x-2 gap-y-1 max-w-[160px] [&_svg]:w-5 [&_svg]:h-5 [&_img]:w-5 [&_img]:h-5'>
						<div className='flex items-center h-6 gap-1 leading-none tabular-nums'>
							<PriceBlock.Param icon='shots'>{shots ?? '—'}</PriceBlock.Param>
						</div>
						<div className='flex items-center h-6 gap-1 leading-none tabular-nums'>
							<PriceBlock.Param icon='caliber'>
								{caliber ?? '—'}
							</PriceBlock.Param>
						</div>
						<div className='flex items-center h-6 gap-1 leading-none tabular-nums'>
							<PriceBlock.Param icon='time' title={fmtSecFull(durationSec)}>
								{renderSec(durationSec)}
							</PriceBlock.Param>
						</div>
						<div className='flex items-center h-6 gap-1 leading-none tabular-nums'>
							<PriceBlock.Param icon='effects'>
								{effectsCount ?? '—'}
							</PriceBlock.Param>
						</div>
					</div>

					<div className='flex flex-col items-end'>
						{hasDiscount && (
							<div className='mb-[2px] text-[14px] font-baron lowercase line-through text-[#BD52E9] font-bold'>
								{fmtPrice(price)}
							</div>
						)}
						<button
							onClick={handleAdd}
							disabled={outOfStock || !currentPrice}
							className={[
								'group w-[79px] h-[27px] pb-[1px] rounded-2xl inline-flex justify-center items-center gap-[5px] cursor-pointer',
								'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]',
								'text-white bg-[#bd52e9] active:bg-[#EFEBE6] active:text-[#625A51]',
								'transition-colors duration-150',
							].join(' ')}
							aria-label='Добавить в корзину'
							title={outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
						>
							<span className='inline-flex font-baron text-[15px] items-center leading-none'>
								{fmtPrice(currentPrice)}
							</span>
							<PlusMobileSvg
								className='w-2.5 h-2.5 mt-[3px] block shrink-0'
								aria-hidden='true'
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(ProductCardMiniMobile)
