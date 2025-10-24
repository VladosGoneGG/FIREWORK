import CursorSvg from '../../CursorSvg/CursorSvg'
import Logotip from '../../Logotip/Logotip'
import BurgerMobile from './BurgerMobile'

const HeaderMobile = () => {
	return (
		<header className='flex flex-row items-end justify-between w-full h-[62px] bg-[#efebe6] pb-[10px] rounded-bl-[30px] rounded-br-[10px] sticky'>
			<div className='w-full flex items-center justify-between'>
				<div className='ml-[10px]'>
					<BurgerMobile />
				</div>
				<div>
					<Logotip />
				</div>
				<div>
					<div className=' flex items-center mr-[10px] gap-2.5'>
						<div className='pt-2'>
							<CursorSvg />
						</div>
						<ul className='font-baron'>
							<li>
								<p className='text-[20px]'>9:00 - 18:00</p>
							</li>
							<li>
								<p className='text-[12px]'>
									каховская <span className='uppercase'>1а/с</span>
								</p>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</header>
	)
}

export default HeaderMobile
