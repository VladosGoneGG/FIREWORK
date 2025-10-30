import BottomBarMobile from './parts/BottomBarMobile'
import HeaderMobile from './parts/HeaderMobile'
import ProductPageMobile from './parts/ProductPageMobile'
import SliderMobile from './parts/SliderMobile'

const HEADER_H = 62 // высота хедера

const LayoutMobile = () => {
	return (
		// Делаем ЯВНЫЙ скролл-контейнер — sticky будет работать внутри него
		<div className='bg-white w-auto h-[100dvh] md:h-[100vh]'>
			<div className='relative scroll-hidden h-full overflow-y-auto overscroll-contain'>
				{/* Липкий хедер внутри того же скролл-контейнера */}
				<HeaderMobile />

				{/* Контент с отступом, чтобы не уезжал под хедер */}
				<div className={`pt-[${HEADER_H}px]`}>
					<SliderMobile />
					<ProductPageMobile />
				</div>

				<BottomBarMobile />
			</div>
		</div>
	)
}

export default LayoutMobile
