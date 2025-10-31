// src/components/CategoryRow/CategoryRow.jsx
import { memo } from 'react'
import iconAll from '../../assets/SVG/icon-all1.svg'
import iconBen from '../../assets/SVG/icon-ben8.svg'
import iconFon from '../../assets/SVG/icon-fon4.svg'
import iconHlop from '../../assets/SVG/icon-hlop7.svg'
import iconPet from '../../assets/SVG/icon-pet5.svg'
import iconRak from '../../assets/SVG/icon-rak9.svg'
import iconRim from '../../assets/SVG/icon-rim3.svg'
import iconSal from '../../assets/SVG/icon-sal2.svg'
import iconVer from '../../assets/SVG/icon-ver6.svg'

import PressableButton from '../PressableButton/PressableButton'

// — порядок иконок по индексу категории
const ICONS = [
	iconAll,
	iconSal,
	iconRim,
	iconFon,
	iconPet,
	iconVer,
	iconHlop,
	iconBen,
	iconRak,
]

// Хелпер: для «салюты» ставим заглавную «С»
const prettyCategoryTitle = name => {
	const raw = String(name || '')
		.trim()
		.replaceAll('ё', 'е')
	return raw.toLowerCase() === 'салюты' ? 'Салюты' : raw
}

const CategoryRow = ({ cat, active, onClick, idx = 0 }) => {
	const icon = ICONS[idx] || ICONS[0]

	return (
		<PressableButton
			pressScale={0.98}
			pressTint={false}
			variant='ghost'
			className={`flex items-center gap-4 my-[5px] w-[220px] h-[30px] text-[12px] rounded-[12px] text-left 
        ${
					active
						? 'text-firework-red font-medium'
						: 'text-[#333] hover:text-firework-red'
				}`}
			onClick={onClick}
			aria-pressed={active}
		>
			<img
				src={icon}
				alt=''
				className={`w-[30px] h-[30px] ${active ? 'opacity-100' : 'opacity-80'}`}
			/>
			{/* normal-case, чтобы не сломать заглавную букву при глобальном lowercase */}
			<span className='truncate normal-case'>
				{prettyCategoryTitle(cat.name)}
			</span>
		</PressableButton>
	)
}

export default memo(CategoryRow)
