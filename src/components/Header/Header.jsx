// src/components/Header/Header.jsx
import Logo from '../../assets/SVG/LOGO.svg'

const Header = ({ rightSlot }) => {
	return (
		<header className='w-[1240px] h-[144px] rounded-b-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.2)] bg-white'>
			<div className='mx-auto max-w-[1240px] px-4 py-3'>
				<div className='flex items-center justify-between select-none'>
					<div>
						<p className='font-baron ml-14 text-[18px] text-[#625a51]'>
							Нижний Новгород
						</p>
					</div>
					<h2 className='font-baron text-[#bf53eb] text-xl tracking-wide'>
						крупнейший магазин пиротехники
					</h2>
					<div className='text-[18px] mr-14 font-baron text-[#625a51]'>
						ип федяков и.в.
					</div>
				</div>

				<div className='w-[1200px] h-[2px] mt-[20px] mb-[15px] rounded-[20px] bg-[#efebe6]' />

				<div className='flex items-center gap-20'>
					<a href='/'>
						<img src={Logo} alt='Логотип' className='ml-[64px]' />
					</a>
					{/* сюда придёт SearchBar из App */}
					{rightSlot}
				</div>
			</div>
		</header>
	)
}
export default Header
