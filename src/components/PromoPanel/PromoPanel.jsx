import promoLeft from '../../assets/SVG/Banner-left.svg'

const PromoPanel = () => {
	return (
		<div className='bg-white flex flex-col items-center mt-[20px] w-[240px] h-[413px] rounded-xl shadow'>
			<img
				src={promoLeft}
				alt='Промо'
				className='w-[220px] mt-[10px] h-[331px]'
			/>
			<button className='btn-firework text-[15px] mt-2'>
				рассчитать стоимость
			</button>
		</div>
	)
}

export default PromoPanel
