import { Link } from 'react-router-dom'

const PromoPanel = () => {
	return (
		<div className='bg-white p-5   mt-[20px] w-[240px] h-[235px]  rounded-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.2)]'>
			<div className='flex flex-col   text-[12px] font-bold text-[#625a51] font-baron  tracking-wider'>
				<ul className=' flex flex-col gap-1 '>
					<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start '>
						<Link to='/contacts'>контакты</Link>
					</li>
					<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'>
						<Link to='/wholesale'>оптовикам</Link>
					</li>
				</ul>

				<ul className=' flex flex-col leading-tight '>
					<li className='my-[20px] '>
						сертификат профессионального пиротехника
					</li>
					<li>
						ип федяков иван <br /> владимирович
					</li>
					<li className='text-[#d2cecb] pt-[10px]'>
						г. нижний новгород, ул. лоцманская 2а
					</li>
				</ul>
			</div>
		</div>
	)
}

export default PromoPanel
