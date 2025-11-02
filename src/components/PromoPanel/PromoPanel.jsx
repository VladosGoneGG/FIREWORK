import promoLeft from '../../assets/SVG/Banner-left.svg'

const PromoPanel = () => {
	return (
		<div className='bg-white flex flex-col justify-between items-center mt-[20px] w-[240px] h-[413px] rounded-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.2)]'>
			<img
				src={promoLeft}
				alt='Промо'
				className='w-[220px] mt-[10px] h-[331px]'
			/>
			<button
				type='button'
				className='mb-2.5 w-[220px] h-[50px]
    rounded-[10px] text-[15px] font-baron tracking-wide lowercase
    transition-colors duration-150 ease-out cursor-pointer
    btn-firework
    isolate
  '
				aria-label='рассчитать стоимость'
				title='рассчитать стоимость'
			>
				<span className='relative z-[1]'>рассчитать стоимость</span>
			</button>
		</div>
	)
}

export default PromoPanel
