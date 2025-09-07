import { memo } from 'react'
import PressableButton from '../PressableButton/PressableButton'

const SubcategoryRow = ({ sub, active, onClick }) => {
	return (
		<li>
			<PressableButton
				className={`w-[190px] h-[30px] text-left rounded-[8px] text-[12px]
          ${
						active
							? 'text-[#997DF5] font-medium'
							: 'text-gray-700 hover:text-firework-red'
					}`}
				onClick={onClick}
				aria-current={active ? 'true' : 'false'}
			>
				{sub.name}
			</PressableButton>
		</li>
	)
}

export default memo(SubcategoryRow)
