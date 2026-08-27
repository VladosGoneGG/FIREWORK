// src/components/LayoutMobile/LayoutMobile.jsx
import { useLocation } from 'react-router-dom' // ⬅️ добавили
import BottomBarMobile from './parts/BottomBarMobile'
import HeaderMobile from './parts/HeaderMobile'
import ProductPageMobile from './parts/ProductPageMobile'
import SliderMobile from './parts/SliderMobile'

const STATIC_PAGES = ['/contacts', '/wholesale']

const LayoutMobile = () => {
	const { pathname } = useLocation()
	const isStaticPage = STATIC_PAGES.includes(pathname)

	return (
		<div className='bg-white w-auto h-[100dvh] md:h-[100vh]'>
			<div className='relative scroll-hidden h-full overflow-y-auto overscroll-contain'>
				<HeaderMobile />
				<div className=' mb-[80px]'>
					{/* ⬇️ просто не рисуем слайдер на статике, остальное не трогаем */}
					{!isStaticPage && <SliderMobile />}
					<ProductPageMobile />
				</div>
				<BottomBarMobile />
			</div>
		</div>
	)
}

export default LayoutMobile
