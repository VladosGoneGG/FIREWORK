// src/components/ProductCardMini/parts/PriceBlock.jsx
import caliberImg from '../../../assets/SVG/radius.svg'
import shotsImg from '../../../assets/SVG/rocket.svg'
import effectsImg from '../../../assets/SVG/star.svg'
import timeImg from '../../../assets/SVG/time.svg'

const ICONS = {
	caliber: caliberImg,
	shots: shotsImg,
	effects: effectsImg,
	time: timeImg,
}

export function Param({ icon, title, children }) {
	const src = ICONS[icon]
	return (
		<div className='flex items-center gap-[7px]' title={title}>
			{src && <img src={src} alt='' className='w-[21px] h-[21px]' />}
			<span className='truncate'>{children}</span>
		</div>
	)
}

function PriceBlock({ price, discountPrice, fmtPrice }) {
	const p = Number(price)
	const dp = Number(discountPrice)
	const hasDiscount =
		Number.isFinite(p) && p > 0 && Number.isFinite(dp) && dp > 0 && dp < p

	return (
		<div className='ml-1 pt-2 leading-none'>
			{hasDiscount ? (
				<>
					{/* старая цена — обычная строка с line-through, без искусственных h/relative */}
					<div className='text-[12px] font-baron lowercase line-through text-[#BD52E9] font-bold'>
						{fmtPrice(p)}
					</div>
					{/* новая цена */}
					<div className='text-[15px] font-bold whitespace-nowrap'>
						{fmtPrice(dp)}
						<span className='text-[10px] font-baron lowercase relative top-0.5 left-[1px] whitespace-nowrap'>
							руб.
						</span>
					</div>
				</>
			) : (
				<div className='text-[15px] font-bold whitespace-nowrap'>
					{fmtPrice(Number.isFinite(p) && p > 0 ? p : 0)}
					<span className='text-[10px] font-baron lowercase relative top-0.5 whitespace-nowrap'>
						руб.
					</span>
				</div>
			)}
		</div>
	)
}

PriceBlock.Param = Param
export default PriceBlock
