// src/components/ProductCardMini/parts/PriceBlock.jsx

// ВАЖНО: пути из /parts → к /assets/SVG
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
			<span>{children}</span>
		</div>
	)
}

function PriceBlock({ price, discountPrice, fmtPrice }) {
	// Нормализуем входы в числа
	const p = Number(price)
	const dp = Number(discountPrice)

	// Валидная скидка: оба числа > 0 и dp < p
	const hasDiscount =
		Number.isFinite(p) && p > 0 && Number.isFinite(dp) && dp > 0 && dp < p

	return (
		<div className='ml-1 pt-2'>
			{hasDiscount ? (
				<>
					{/* старая цена (зачёркнутая) */}
					<div className='relative bottom-2.5 h-[2.5px] text-[12px] font-baron lowercase line-through text-[#BD52E9] font-bold'>
						{fmtPrice(p)}
					</div>
					{/* новая цена */}
					<div className='text-[15px] font-bold'>
						{fmtPrice(dp)}
						<span className='text-[8px] font-baron lowercase relative top-0.5 left-[1px]'>
							руб.
						</span>
					</div>
				</>
			) : (
				<div className='text-[15px] font-bold pb-[3px]'>
					{fmtPrice(Number.isFinite(p) && p > 0 ? p : 0)}
					<span className='text-[8px] font-baron lowercase relative top-0.5'>
						руб.
					</span>
				</div>
			)}
		</div>
	)
}

// КЛЮЧЕВОЕ: прикрепляем подкомпонент
PriceBlock.Param = Param

export default PriceBlock
