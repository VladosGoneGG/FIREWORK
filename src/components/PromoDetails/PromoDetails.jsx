// src/components/PromoDetails/PromoDetails.jsx
import { memo } from 'react'
import PromoBanner2 from '../../assets/SVG/BannerMain2.svg'
import PressableButton from '../PressableButton/PressableButton'
import ProductCardMini from '../ProductCardMini/ProductCardMini'
import BackButton from '../ui/BackButton'

/**
 * Props:
 * - currentCategory?: string
 * - description?: string
 * - related?: Product[]
 * - onBack: () => void
 * - onSelectProduct: (product) => void
 * - onOpenSubcategory: (categoryString) => void
 */
const PromoDetails = ({
	currentCategory = '',
	description = 'Текст промо-акции. Добавь сюда условия и преимущества.',
	related = [],
	onBack,
	onSelectProduct,
	onOpenSubcategory,
}) => {
	return (
		<section className='bg-white rounded-[20px] w-[925px] h-[834px] overflow-hidden flex flex-col'>
			<div className='p-2.5 flex flex-col gap-3 h-full'>
				{/* Баннер */}
				<div className='relative w-[900px] h-72 rounded-[10px] overflow-hidden mx-auto'>
					<img
						src={PromoBanner2}
						alt='Промо шоу'
						className='w-full rounded-[12.5px] h-full object-cover block'
					/>

					{/* Назад — фикс: absolute + координаты (позиционируем обёртку BackButton, вариант B) */}
					<BackButton
						onClick={onBack}
						className='absolute top-[0px] left-[0px] z-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]'
					/>
				</div>

				{/* Описание */}
				<div className='px-2'>
					<div className='font-baron text-black text-lg mb-1 lowercase'>
						описание:
					</div>
					<p className='text-stone-600 text-base font-[Calibri]'>
						{description}
					</p>
				</div>

				{/* Подарки / связанное */}
				{!!related.length && (
					<div className='mt-auto'>
						<div className='mt-4'>
							<PressableButton className='btn-firework w-[220px] h-[50px] text-[15px] font-baron tracking-wide  mb-[20px]'>
								рассчитать стоимость
							</PressableButton>
						</div>
						<div className='font-baron text-black text-lg mb-2 lowercase'>
							выбери свой подарок
						</div>

						<div className='mt-2 text-right'>
							<button
								type='button'
								className='text-[10px] text-[#625a51] lowercase font-baron hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer'
								onClick={() => onOpenSubcategory?.(currentCategory)}
							>
								посмотреть ещё
							</button>
						</div>

						<div className='grid grid-cols-7 gap-2.5 overflow-y-auto scroll-hidden'>
							{related.slice(0, 7).map(p => (
								<ProductCardMini
									key={p.id}
									product={p}
									onSelect={() => onSelectProduct?.(p)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	)
}

export default memo(PromoDetails)
