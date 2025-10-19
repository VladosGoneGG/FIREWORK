// src/components/ProductCardMini/parts/ProductMeta.jsx
export default function ProductMeta({ name, manufacturer }) {
	return (
		<div className='text-left'>
			<h4 className='font-barlow font-semibold leading-tight text-[12px] line-clamp-1'>
				{name}
			</h4>
			<div className='text-[8px] text-[#625a51] font-bold lowercase truncate'>
				{manufacturer || '—'}
			</div>
		</div>
	)
}
