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
		<div className='flex items-center gap-1' title={title}>
			{src && <img src={src} alt='' className='w-[12px] h-[12px]' />}
			<span>{children}</span>
		</div>
	)
}

function PriceBlock({ price, discountPrice, fmtPrice }) {
	const hasDiscount = typeof discountPrice === 'number'
	return (
		<div className='ml-3'>
			{hasDiscount ? (
				<>
					<div className='text-[8px] font-baron lowercase line-through text-[#BD52E9] font-bold'>
						{fmtPrice(price)}
					</div>
					<div className='text-[12px] font-bold'>
						{fmtPrice(discountPrice)}
						<span className='text-[8px] font-baron lowercase relative top-0.5 left-[1px]'>
							руб.
						</span>
					</div>
				</>
			) : (
				<div className='text-[12px] font-bold'>
					{fmtPrice(price)}
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
