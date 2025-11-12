// src/components/LayoutMobile/LayoutMobile.jsx
import { useLocation } from 'react-router-dom' // ⬅️ добавили
import BottomBarMobile from './parts/BottomBarMobile'
import HeaderMobile from './parts/HeaderMobile'
import ProductPageMobile from './parts/ProductPageMobile'
import SliderMobile from './parts/SliderMobile'

const HEADER_H = 62

const LayoutMobile = () => {
	const { pathname } = useLocation() // ⬅️
	const isStatic = pathname === '/contacts' || pathname === '/wholesale' // ⬅️

	return (
		<div className='bg-white w-auto h-[100dvh] md:h-[100vh]'>
			<div className='relative scroll-hidden h-full overflow-y-auto overscroll-contain'>
				<HeaderMobile />
				<div className={`pt-[${HEADER_H}px] mb-[80px]`}>
					{/* ⬇️ просто не рисуем слайдер на статике, остальное не трогаем */}
					{!isStatic && <SliderMobile />}
					<ProductPageMobile />
				</div>
				<BottomBarMobile />
			</div>
		</div>
	)
}

export default LayoutMobile
