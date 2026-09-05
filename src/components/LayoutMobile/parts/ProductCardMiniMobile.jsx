// src/components/ProductCardMini/ProductCardMiniMobile.jsx
import { memo, useCallback, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addItem } from '../../../store/slices/cartSlice'
import { fmtPrice, fmtSecFull, renderSec } from '../../../utils/format'
import PlusMobileSvg from '../../PlusMobileSvg/PlusMobileSvg'
import PriceBlock from '../../ProductCardMini/parts/PriceBlock'
import ProductThumb from '../../ProductCardMini/parts/ProductThumb'

function ProductCardMiniMobile({ product, onSelect }) {
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

	const [pressed, setPressed] = useState(false)
	const pressTimer = useRef(null)

	const handleAddClick = e => {
		handleAdd(e) // твоя логика добавления
		// короткая "вспышка" активного стиля
		clearTimeout(pressTimer.current)
		setPressed(true)
		pressTimer.current = setTimeout(() => setPressed(false), 180)
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

	const toNum = v => {
		const s = String(v ?? '').replace(/[^\d]/g, '') // оставляем только цифры
		return s ? Number(s) : 0
	}
	const calcUnit = p => {
		// приоритет как и в корзине: скидка -> price
		const d = toNum(p?.discountPrice)
		const base = toNum(p?.price)
		return d || base
	}
	const handleAdd = useCallback(
		e => {
			e.stopPropagation()
			if (outOfStock) return
			dispatch(addItem({ ...product, unitPrice: calcUnit(product) }))
		},
		[dispatch, product, outOfStock]
	)
	const handleOpen = useCallback(() => {
		onSelect?.(product)
	}, [onSelect, product])

	const currentPrice = Number(discountPrice) || Number(price) || 0
	const hasDiscount =
		Number(discountPrice) > 0 && Number(discountPrice) < Number(price)

	return (
		<div
			onClick={handleOpen}
			className={[
				'flex flex-row items-center w-full  min-h-[120px] justify-between rounded-[20px]',
				'shadow-[0_0_10px_rgba(0,0,0,0.2)] bg-white px-2.5',
				'select-none outline-none cursor-pointer',
				'min-w-0',
				outOfStock ? 'opacity-70' : '',
			].join(' ')}
		>
			{/* превью */}
			<div className='relative w-[100px] h-[100px] rounded-[10px] overflow-hidden shrink-0'>
				{img ? (
					<ProductThumb
						src={typeof img === 'string' ? img : img?.url || img?.src}
						alt={name || 'product'}
						outOfStock={outOfStock}
						badgeText='Нет в наличии'
					/>
				) : (
					<img
						src='/SVG/full-block.svg'
						alt='product'
						className='w-full h-full object-cover'
					/>
				)}
				{!img && outOfStock && (
					<div className='absolute left-1 top-1 px-1.5 py-[1px] rounded-[6px] text-[9px] bg-black/60 text-white'>
						Нет в наличии
					</div>
				)}
			</div>

			<div className='flex flex-col justify-between gap-[9px] flex-1 min-w-0 h-[100px] pl-2'>
				{/* заголовок + бейдж */}
				<div className='flex justify-between items-start h-[27px]'>
					{/* ⬇️ добавили min-w-0, чтобы текст корректно обрезался и не толкал рядом стоящее */}
					<ul className='w-auto'>
						<li className='leading-[14px]'>
							<p className='font-barlow font-normal text-[12px]  text-black '>
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
						<div className='w-[49px] h-[22px]  bg-[#098d00]/70 rounded-[10px] flex justify-center items-end overflow-hidden shrink-0'>
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
				<div className='flex items-end justify-between  h-[60px] text-[12px] text-[#625A51] font-baron min-w-0'>
					<div className='flex-1 min-w-0 grid grid-cols-2   max-w-[130px] [&_svg]:w-5 [&_svg]:h-5 [&_img]:w-5 [&_img]:h-5'>
						<div className='flex items-center h-6  leading-none tabular-nums'>
							<PriceBlock.Param icon='shots'>{shots ?? '—'}</PriceBlock.Param>
						</div>
						<div className='flex items-center h-6 gap-1 leading-none tabular-nums'>
							<PriceBlock.Param icon='caliber'>
								{caliber ?? '—'}
							</PriceBlock.Param>
						</div>
						<div className='flex items-center h-6 gap-1  leading-none  tabular-nums'>
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

					{/* ⬇️ правая колонка с ценой/кнопкой — фиксируем, чтобы её не расплющивало */}
					<div className='flex flex-col items-end shrink-0'>
						{hasDiscount && (
							<div className='mb-[5px] text-[15px] font-baron lowercase line-through text-[#B4B4B4] font-bold'>
								{fmtPrice(price)}
							</div>
						)}
						{!outOfStock && (
							<button
								onClick={handleAddClick}
								disabled={!currentPrice}
								aria-pressed={pressed}
								className={[
									'group w-[79px] h-[27px] pb-[1px] rounded-2xl inline-flex justify-center items-center gap-[5px] cursor-pointer',
									'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]',
									// базовые цвета
									'transition-colors duration-150',
									// было: 'text-white bg-[#bd52e9] active:bg-[#EFEBE6] active:text-[#625A51]'
									// стало: те же цвета, но включаем на клик через state
									pressed
										? 'bg-[#EFEBE6] text-[#625A51]'
										: 'bg-[#bd52e9] text-white',
								].join(' ')}
								aria-label='Добавить в корзину'
								title='Добавить в корзину'
							>
								<span className='inline-flex font-baron text-[15px] items-center leading-none'>
									{fmtPrice(currentPrice)}
								</span>
								<PlusMobileSvg
									className='w-2.5 h-2.5 mt-[3px] block shrink-0'
									aria-hidden='true'
								/>
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(ProductCardMiniMobile)
