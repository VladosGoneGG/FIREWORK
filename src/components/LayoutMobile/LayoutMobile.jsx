import HeaderMobile from './parts/HeaderMobile'
import ProductPageMobile from './parts/ProductPageMobile'
import SliderMobile from './parts/SliderMobile'

const LayoutMobile = () => {
	return (
		<div className='bg-white w-auto min-h-[100vh]'>
			<HeaderMobile />
			<SliderMobile />
			<ProductPageMobile />
		</div>
	)
}

export default LayoutMobile
