import { memo } from 'react'
import minBlock from '../../assets/SVG/min-block.svg'
import PressableButton from '../PressableButton/PressableButton'

const CategoryRow = ({ cat, active, onClick }) => {
	return (
		<PressableButton
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
				src={minBlock}
				alt=''
				className={`w-[30px] h-[30px] ${active ? 'opacity-100' : 'opacity-80'}`}
			/>
			<span className='truncate'>{cat.name}</span>
		</PressableButton>
	)
}

export default memo(CategoryRow)
