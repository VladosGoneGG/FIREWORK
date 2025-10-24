// src/components/LayoutMobile/parts/BottomBarMobile.jsx
import SearchBar from '../../Search/SearchBar'
import ProductCartMobile from './ProductCartMobile'

const BottomBarMobile = () => {
	return (
		<div
			className='fixed inset-x-2.5 z-[100] '
			style={{ bottom: 'max(10px, env(safe-area-inset-bottom))' }} // 10px + безопасная зона iOS
		>
			<div
				className={[
					'flex items-center gap-2.5',
					'px-2.5 h-[70px] bg-[#efebe6] rounded-[30px]',
					'w-full max-w-[680px] mx-auto',
					// тени/эстетика по желанию: 'shadow-[0px_1px_3px_rgba(0,0,0,0.15)]'
				].join(' ')}
			>
				{/* Поиск — тянется и сжимается */}
				<div className='flex-1 min-w-0'>
					<SearchBar />
				</div>

				{/* Корзина — фикс. ширина, не сжимается; правый визуальный отступ сохранится */}
				<div className='shrink-0'>
					<ProductCartMobile />
				</div>
			</div>
		</div>
	)
}

export default BottomBarMobile
