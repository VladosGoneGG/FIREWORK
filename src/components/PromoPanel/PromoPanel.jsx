import promoLeft from '../../assets/SVG/Banner-left.svg'
import PressableButton from '../PressableButton/PressableButton'

const PromoPanel = () => {
	return (
		<div className='bg-white flex flex-col items-center mt-[20px] w-[240px] h-[413px] rounded-xl shadow-[0_0_10px_0_rgba(0,0,0,0.2)]'>
			<img
				src={promoLeft}
				alt='Промо'
				className='w-[220px] mt-[10px] h-[331px]'
			/>
			<PressableButton className='btn-firework w-[220px] h-[50px] text-[15px] font-baron tracking-wide  mt-2'>
				рассчитать стоимость
			</PressableButton>
		</div>
	)
}

export default PromoPanel
