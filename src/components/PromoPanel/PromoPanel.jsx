import promoLeft from '../../assets/SVG/Banner-left.svg'
import PressableButton from '../PressableButton/PressableButton'

const PromoPanel = () => {
	return (
		<div className='bg-white flex flex-col items-center mt-[20px] w-[240px] h-[413px] rounded-xl shadow'>
			<img
				src={promoLeft}
				alt='Промо'
				className='w-[220px] mt-[10px] h-[331px]'
			/>
			<PressableButton className='btn-firework w-[220px] h-[50px] text-[15px] font-calibri tracking-wider  mt-2'>
				рассчитать стоимость
			</PressableButton>
		</div>
	)
}

export default PromoPanel
