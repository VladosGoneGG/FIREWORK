import CursorSvg from '../../CursorSvg/CursorSvg'
import Logotip from '../../Logotip/Logotip'
import BurgerMobile from './BurgerMobile'

const HeaderMobile = () => {
	return (
		<header
			className={[
				'sticky top-0 z-[120]', // липкий + поверх контента
				'flex flex-row items-end justify-between w-full',
				'h-[60px] bg-[#efebe6] ',
				'rounded-bl-[30px] rounded-br-[10px]',
				'shadow-[0_1px_6px_rgba(0,0,0,0.08)]',
			].join(' ')}
			style={{ willChange: 'transform' }}
		>
			<div className='w-full flex  items-end'>
				<div className='w-[180px] ml-[10px] mb-[6px] flex justify-between j  '>
					<div>
						<BurgerMobile />
					</div>
					<div>
						<a href='/'>
							<Logotip />
						</a>
					</div>
				</div>
				<div className='ml-auto mb-2.5'>
					<div className='flex w-[150px] items-center justify-end mr-2.5 gap-2.5'>
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
