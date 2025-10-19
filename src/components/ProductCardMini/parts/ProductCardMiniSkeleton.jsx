// src/components/ProductCardMini/parts/ProductCardMiniSkeleton.jsx
const Shimmer = ({ className = '' }) => (
	<div className={`bg-zinc-200/80 animate-pulse rounded ${className}`} />
)

export default function ProductCardMiniSkeleton() {
	return (
		<div className='w-full h-full bg-white'>
			<div className='h-full w-full flex flex-col'>
				{/* фото */}
				<div className='mx-auto w-[100px] h-[100px] rounded-[10px] overflow-hidden relative'>
					<Shimmer className='w-full h-full' />
					<div className='absolute left-1 top-1 w-16 h-[12px] rounded-[6px] bg-black/10' />
				</div>

				{/* имя / производитель */}
				<div className='text-center mt-1 px-2 space-y-1 h-[34px]'>
					<Shimmer className='h-[12px] w-[90%] mx-auto' />
					<Shimmer className='h-[8px] w-1/2 mx-auto' />
				</div>

				{/* параметры */}
				<div className='mt-1 flex justify-evenly h-[25px]'>
					<div className='flex flex-col gap-2'>
						<div className='flex items-center gap-1'>
							<Shimmer className='w-[12px] h-[12px] rounded' />
							<Shimmer className='w-6 h-3' />
						</div>
						<div className='flex items-center gap-1'>
							<Shimmer className='w-[12px] h-[12px] rounded' />
							<Shimmer className='w-8 h-3' />
						</div>
					</div>
					<div className='flex flex-col gap-2'>
						<div className='flex items-center gap-1'>
							<Shimmer className='w-[12px] h-[12px] rounded' />
							<Shimmer className='w-6 h-3' />
						</div>
						<div className='flex items-center gap-1'>
							<Shimmer className='w-[12px] h-[12px] rounded' />
							<Shimmer className='w-8 h-3' />
						</div>
					</div>
				</div>

				{/* цена + кнопка */}
				<div className='mt-auto flex items-end justify-between px-3 pb-1 h-[28px]'>
					<div className='space-y-1'>
						<Shimmer className='h-[8px] w-10' />
						<Shimmer className='h-[12px] w-16' />
					</div>
					<Shimmer className='w-[40px] h-[25px] rounded-[10px]' />
				</div>
			</div>
		</div>
	)
}
