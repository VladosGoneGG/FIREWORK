// src/components/PromoDetails/PromoDetails.jsx
import { memo } from 'react'
import ProductCardMini from '../ProductCardMini/ProductCardMini'

/**
 * Простой экран промо, похожий на ProductDetails.
 * Props:
 * - banner: string — src баннера (по умолчанию тот же, что на главной)
 * - titleLines?: string[] — необязательные тексты поверх баннера
 * - description?: string
 * - related?: Product[]
 * - onBack: () => void
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory?: (payload) => void
 */
const PromoDetails = ({
	banner,
	description = 'Текст промо-акции. Добавь сюда условия и преимущества.',
	related = [],
	onBack,
	onSelectProduct,
	onOpenSubcategory,
}) => {
	return (
		<section className='bg-white rounded-[20px] w-[925px] h-[834px] overflow-hidden flex flex-col'>
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* Блок баннера (как медиа) */}
				<div className='relative w-[900px] h-72 rounded-[10px] overflow-hidden mx-auto'>
					<img
						src={banner}
						alt='Промо'
						className='absolute inset-0 w-full h-full object-cover'
					/>

					{/* Кнопка Назад */}
					<button
						type='button'
						onClick={onBack}
						className='
              absolute left-2 top-2 z-10
              text-[12px] px-2 py-1 rounded-[8px]
              bg-white/85 hover:bg-white
              shadow-[0_0_10px_rgba(0,0,0,0.15)]
              backdrop-blur-[2px]
            '
						aria-label='Назад'
						title='Назад'
					>
						← Назад
					</button>
				</div>

				{/* Описание + CTA */}
				<div className='px-2'>
					<div className='font-baron text-black text-lg mb-1 lowercase'>
						описание:
					</div>
					<p className='text-stone-600 text-base font-[Calibri]'>
						{description}
					</p>

					<div className='mt-4'>
						<button
							type='button'
							className='px-6 h-12 rounded-[10px] bg-[radial-gradient(ellipse_173.76%_142.27%_at_-13.16%_-0%,_#1D0353_0%,_#C054EB_100%)] text-white font-baron text-base lowercase hover:opacity-95 active:opacity-90 transition'
						>
							заказать звонок
						</button>
					</div>
				</div>

				{/* Ниже — «Выбери свой подарок» + 7 товаров */}
				{related?.length > 0 && (
					<div className='mt-auto'>
						<div className='font-baron text-black text-lg mb-2 lowercase'>
							выбери свой подарок
						</div>

						<div className='grid grid-cols-7 gap-2.5 overflow-y-auto scroll-hidden'>
							{related.slice(0, 7).map(p => (
								<ProductCardMini
									key={p.id}
									product={p}
									onSelect={() => onSelectProduct?.(p)} // открываем детали выбранного товара
								/>
							))}
						</div>

						<div className='mt-2 text-right'>
							<button
								type='button'
								className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5]'
								onClick={() => onOpenSubcategory?.({ title: 'подарки' })}
							>
								посмотреть ещё
							</button>
						</div>
					</div>
				)}
			</div>
		</section>
	)
}

export default memo(PromoDetails)
