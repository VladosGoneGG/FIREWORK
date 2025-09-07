// src/components/PromoMain/PromoMain.jsx
import promoMain from '../../assets/SVG/bannerMain.svg'

const PromoMain = ({ onOpen }) => {
	return (
		<button
			type='button'
			onClick={onOpen}
			className='mb-9 block w-full rounded-[10px] overflow-hidden focus:outline-none hover:opacity-95 active:opacity-90 transition'
			aria-label='Открыть промо'
			title='Открыть промо'
		>
			<img src={promoMain} alt='Промо главная' className='w-full h-auto' />
		</button>
	)
}

export default PromoMain
