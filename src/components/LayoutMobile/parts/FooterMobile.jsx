// src/components/LayoutMobile/parts/FooterMobile.jsx
import { memo } from 'react'
import { Link } from 'react-router-dom'

const FooterMobile = () => {
	return (
		<footer
			role='contentinfo'
			className={[
				'bg-[#efebe6] pt-[20px] pl-[31px] w-full min-h-[100px] shadow-none',
				'max-[680px]:pl-[16px] max-[680px]:pt-[16px]',
			].join(' ')}
		>
			<div
				className={[
					'flex gap-[59px] text-[12px] font-bold text-[#625a51] font-inter tracking-wider',
					'max-[680px]:gap-6 max-[360px]:gap-4',
				].join(' ')}
			>
				<div>
					<ul className='uppercase flex flex-col gap-[10px]'>
						{/* ⬇️ был просто текст — делаем роут */}
						<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'>
							<Link to='/contacts'>контакты</Link>
						</li>
						<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'>
							условия доставки
						</li>
						<li className='hover:text-[#bd52e9] active:text-[#997DF5] cursor-pointer self-start'>
							<Link to='/wholesale'>оптовикам</Link>
						</li>
					</ul>
				</div>

				<div>
					<ul className='uppercase flex flex-col gap-[10px]'>
						<li>сертификат профессионального пиротехника</li>
						<li>ип федяков иван владимирович</li>
						<li className='text-[#d2cecb]'>
							г. нижний новгород, ул. лоцманская 2а
						</li>
					</ul>
				</div>
			</div>
		</footer>
	)
}

export default memo(FooterMobile)
