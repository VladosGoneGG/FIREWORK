// FooterSection.jsx
import { Link } from 'react-router-dom'

const FooterSection = () => {
	return (
		<footer className='bg-[#efebe6] pt-[20px] pl-[31px] w-full min-h-[100px] shadow-none'>
			<div className='flex gap-[59px] text-[12px] font-bold text-[#625a51] font-inter tracking-wider'>
				<div>
					<ul className='uppercase flex flex-col gap-[10px]'>
						<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'>
							<Link to='/contacts'>контакты</Link>
						</li>
						<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'>
							<Link to='/wholesale'>оптовикам</Link>
						</li>
					</ul>
				</div>
				<div>
					<ul className='uppercase flex flex-col gap-[10px]'>
						<li>ип федяков иван владимирович</li>
						<li>сертификат профессионального пиротехника</li>
						<li className='text-[#d2cecb]'>
							г. нижний новгород, ул. лоцманская 2а
						</li>
					</ul>
				</div>
			</div>
		</footer>
	)
}
export default FooterSection
