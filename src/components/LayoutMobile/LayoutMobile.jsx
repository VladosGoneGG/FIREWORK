// src/components/LayoutMobile/LayoutMobile.jsx
import BottomBarMobile from './parts/BottomBarMobile'
import HeaderMobile from './parts/HeaderMobile'
import ProductPageMobile from './parts/ProductPageMobile'
import SliderMobile from './parts/SliderMobile'

const LayoutMobile = () => {
	return (
		<div className='bg-white w-auto min-h-[100vh] pb-[100px]'>
			{/* ↑ 70px высота бара + ~10px отступ + запас, чтобы контент не прятался под бар */}
			<HeaderMobile />
			<SliderMobile />
			<ProductPageMobile />
			{/* Фиксированный бар сам даёт отступы слева/справа/снизу — обёртка не нужна */}
			<BottomBarMobile />
		</div>
	)
}

export default LayoutMobile
