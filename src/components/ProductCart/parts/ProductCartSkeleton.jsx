// Скелет для корзины: сохраняет размеры и визуальную структуру
import { memo } from 'react'

const Line = ({ w = 'w-24', h = 'h-3', className = '' }) => (
	<div className={`bg-[#eee] rounded ${w} ${h} animate-pulse ${className}`} />
)

const ItemSkeleton = () => (
	<div className='flex items-center gap-3'>
		{/* Превью */}
		<div className='w-[70px] h-[70px] rounded-[10px] bg-[#f0efed] animate-pulse' />

		{/* Текст */}
		<div className='flex-1 min-w-0'>
			<Line w='w-40' h='h-3' />
			<Line w='w-24' h='h-2' className='mt-2' />

			<div className='mt-2 flex items-center justify-between'>
				{/* Счётчик */}
				<div className='inline-flex items-center gap-2 w-[50px] h-[20px] rounded-full bg-[#f2f0ed] animate-pulse' />
				{/* Цена */}
				<Line w='w-16' h='h-4' />
			</div>
		</div>
	</div>
)

const ProductCartSkeleton = () => (
	<aside
		className='
      bg-white rounded-[20px] w-[295px] h-[834px]
      shadow-[0_0_15px_rgba(0,0,0,0.15)]
      flex flex-col overflow-hidden font-baron lowercase
    '
		aria-busy='true'
		aria-live='polite'
	>
		{/* Header */}
		<div className='px-4 pt-4 pb-3'>
			<Line w='w-24' h='h-5' />
		</div>

		{/* Divider */}
		<div className='w-[260px] h-[2px] ml-[18px] rounded-[20px] bg-[#efebe6]' />

		{/* List */}
		<div className='flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-hidden'>
			<ItemSkeleton />
			<ItemSkeleton />
			<ItemSkeleton />
			<ItemSkeleton />
		</div>

		{/* Footer */}
		<div className='mt-auto px-4 pb-4 pt-3 bg-white'>
			<Line w='w-12' h='h-3' className='mx-auto' />
			<Line w='w-24' h='h-6' className='mx-auto mt-2' />
			<div className='w-full mt-3 h-[44px] rounded-[12px] bg-[#efebe6] animate-pulse' />
		</div>
	</aside>
)

export default memo(ProductCartSkeleton)
