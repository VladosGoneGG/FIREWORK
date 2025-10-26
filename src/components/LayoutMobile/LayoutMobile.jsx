// src/components/LayoutMobile/LayoutMobile.jsx
import BottomBarMobile from './parts/BottomBarMobile'
import HeaderMobile from './parts/HeaderMobile'
import ProductPageMobile from './parts/ProductPageMobile'
import SliderMobile from './parts/SliderMobile'

const LayoutMobile = () => {
	return (
		<div className='bg-white w-auto min-h-[100dvh] md:min-h-[100vh] pb-[100px]'>
			<HeaderMobile />
			<SliderMobile />
			<ProductPageMobile />
			<BottomBarMobile />
		</div>
	)
}

export default LayoutMobile
