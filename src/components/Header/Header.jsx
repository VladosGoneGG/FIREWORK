import Logo from '../../assets/SVG/LOGO.svg'
import NovgorodSvg from '../../assets/SVG/nn.svg'
import SearchHeader from '../SearchHeader/SearchHeader'

const Header = () => {
	return (
		<header className='w-[1240px] h-[150px] rounded-b-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.2)] bg-white '>
			<div className='mx-auto max-w-[1240px] px-4 py-3'>
				{/* верхняя полоса */}
				<div className='flex items-center justify-between select-none'>
					<div>
						<img src={NovgorodSvg} alt='Нижний Новгород' className='ml-14' />
					</div>
					<div className='font-inter uppercase font-bold text-[#bf53eb] text-xl tracking-wide'>
						крупнейший магазин пиротехники
					</div>
					<div className='uppercase text-[18px] mr-14 font-inter font-bold text-[#625a51]'>
						ип федяков и.в.
					</div>
				</div>
				<div className='w-[1200px] h-[2px] my-[20px] rounded-[20px] bg-[#efebe6]' />
				<div className='mt-3 flex items-center gap-20'>
					<a href='/'>
						<img src={Logo} alt='Логотип' className='ml-20' />
					</a>
					<SearchHeader />
				</div>
			</div>
		</header>
	)
}

export default Header
