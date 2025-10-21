import { memo } from 'react'
import PromoSlider from '../../PromoSlider/PromoSlider'

/**
 * Мобильный промо-слайдер.
 * Использует тот же PromoSlider, но растягивается на всю ширину мобильного контейнера.
 * При желании можешь передать свои картинки через проп images.
 */
const SliderMobile = ({ images, intervalMs = 3500 }) => {
	return (
		<div className='w-full px-3 mt-2'>
			<PromoSlider
				images={images}
				intervalMs={intervalMs}
				fit='cover'
				active={true}
				// На мобиле убираем max-width из десктопной версии и даём чуть больший радиус
				className='w-full max-w-none rounded-[20px]'
			/>
		</div>
	)
}

export default memo(SliderMobile)
