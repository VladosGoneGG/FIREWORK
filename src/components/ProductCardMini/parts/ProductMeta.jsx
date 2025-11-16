// src/components/ProductCardMini/parts/ProductMeta.jsx

export default function ProductMeta({ name, manufacturer }) {
	return (
		<div className='text-left pt-[5px]'>
			<h4 className='font-barlow font-semibold leading-tight break-words line-clamp-1 text-[13px]'>
				{name}
			</h4>
			<div className='text-[8px] text-[#625a51] font-bold lowercase'>
				{manufacturer || '—'}
			</div>
		</div>
	)
}
