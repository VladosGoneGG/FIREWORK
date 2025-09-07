import { memo } from 'react'

const DescriptionBlock = ({ description }) => {
	return (
		<div className='bg-transparent rounded-[12px] p-2 min-h-[120px] max-h-[220px] overflow-y-auto scroll-hidden'>
			<div className='font-semibold mb-1'>ОПИСАНИЕ:</div>
			<p className='text-[14px] opacity-80'>
				{description || 'Описание товара отсутствует.'}
			</p>
		</div>
	)
}

export default memo(DescriptionBlock)
