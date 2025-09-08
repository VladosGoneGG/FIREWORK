// src/components/PromoMain/PromoMain.jsx
import promoMain from '../../assets/SVG/bannerMain.svg'

const PromoMain = ({ onOpen }) => {
	return (
		<button
			type='button'
			onClick={() => onOpen?.()}
			className='mb-9 block cursor-pointer focus:outline-none'
			aria-label='Открыть акцию'
			title='Открыть акцию'
		>
			<img src={promoMain} alt='Промо главная' />
		</button>
	)
}

export default PromoMain
