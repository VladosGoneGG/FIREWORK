// src/components/ProductCardMini/parts/PriceBlock.jsx

// ВАЖНО: пути из /parts → к /assets/SVG
import caliberImg from '../../../assets/SVG/radius.svg'
import shotsImg from '../../../assets/SVG/rocket.svg'
import effectsImg from '../../../assets/SVG/star.svg'
import timeImg from '../../../assets/SVG/time.svg'
import { getPriceDisplay } from '../../../utils/price'

const ICONS = {
	caliber: caliberImg,
	shots: shotsImg,
	effects: effectsImg,
	time: timeImg,
}

export function Param({ icon, title, children }) {
	const src = ICONS[icon]
	// Приглушаем строку, если значения нет — чтобы реальные характеристики
	// не терялись среди четырёх одинаковых прочерков.
	const isEmpty = children === '—'
	return (
		<div
			className={['flex items-center gap-[7px]', isEmpty ? 'opacity-40' : ''].join(' ')}
			title={title}
		>
			{src && <img src={src} alt='' className='w-[21px] h-[21px]' />}
			<span>{children}</span>
		</div>
	)
}

function PriceBlock({ price, discountPrice, fmtPrice }) {
	// Единая логика: скидка валидна, только если price и discountPrice
	// заданы и discountPrice < price. Если задана только discountPrice —
	// она становится основной ценой (см. utils/price.getPriceDisplay).
	const { hasDiscount, original, current } = getPriceDisplay({
		price,
		discountPrice,
	})

	return (
		<div className='ml-1 pt-2'>
			{hasDiscount && (
				// старая цена (зачёркнутая)
				<div className='relative bottom-2.5 h-[2.5px] text-[12px] font-baron lowercase line-through text-[#BD52E9] font-bold'>
					{fmtPrice(original)}
					<span className='inline-block text-[8px] font-baron lowercase no-underline relative top-0.5 left-[1px]'>
						{' '}
						руб.
					</span>
				</div>
			)}
			<div
				className={
					hasDiscount
						? 'text-[15px] font-bold'
						: 'text-[15px] font-bold pb-[3px]'
				}
			>
				{fmtPrice(current)}
				<span
					className={[
						'text-[8px] font-baron lowercase relative top-0.5',
						hasDiscount ? 'left-[1px]' : '',
					].join(' ')}
				>
					руб.
				</span>
			</div>
		</div>
	)
}

// КЛЮЧЕВОЕ: прикрепляем подкомпонент
PriceBlock.Param = Param

export default PriceBlock
