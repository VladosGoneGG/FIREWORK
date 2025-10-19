// src/components/CategoryFilter/CategoryFilterSkeleton.jsx
import { SkeletonBlock, SkeletonCircle } from '../Skeleton/Skeleton'

const Row = () => (
	<div className='flex items-center gap-4 my-[5px] w-full h-[30px]'>
		<SkeletonCircle size={30} />
		<SkeletonBlock className='h-[12px] w-[150px] max-w-full rounded-[4px]' />
	</div>
)

const SubRow = () => (
	<div className='pl-9 my-[5px]'>
		<SkeletonBlock className='h-[12px] w-[140px] max-w-full rounded-[4px]' />
	</div>
)

const CategoryFilterSkeleton = ({ className = '' }) => {
	return (
		<aside
			className={[
				'w-full bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)]',
				className,
			].join(' ')}
		>
			{/* верхние 4 категории */}
			<div className='mt-1'>
				<Row />
				<Row />
				<Row />
				<Row />
			</div>

			{/* имитация раскрытой категории с подкатегориями */}
			<div className='mt-2'>
				<Row />
				<div className='mt-1 space-y-1'>
					<SubRow />
					<SubRow />
					<SubRow />
				</div>
			</div>
		</aside>
	)
}

export default CategoryFilterSkeleton
