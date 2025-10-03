import { memo } from 'react'
import PressableButton from '../PressableButton/PressableButton'

const SubcategoryRow = ({ sub, active, onClick }) => {
	return (
		<li>
			<PressableButton
				pressTint={false}
				pressScale={0.98}
				variant='ghost' // ⬅️ важно: без цветных слоёв, цвета берутся из классов ниже
				onClick={onClick}
				aria-current={active ? 'true' : 'false'}
				className={`w-[190px] h-[30px] text-left rounded-[8px] text-[12px]
          ${
						active
							? 'text-[#997DF5] font-medium'
							: 'text-gray-700 hover:text-firework-red'
					}
        `}
			>
				{sub.name}
			</PressableButton>
		</li>
	)
}

export default memo(SubcategoryRow)
