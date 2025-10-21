import Logotip from '../Logotip/Logotip'

const Header = ({ rightSlot }) => {
	return (
		<header
			className='
        mx-auto
        w-[min(1240px,calc(100vw-20px))]
        bg-white rounded-b-[20px]
        shadow-[0_0_10px_0_rgba(0,0,0,0.2)]
      '
		>
			<div className='py-4'>
				{/* Верхняя строка */}
				<div className='flex items-center justify-between gap-6 select-none px-4'>
					<p className='ml-[46px] font-baron text-[#625a51] text-[18px]'>
						Нижний Новгород
					</p>

					<h2
						className='
              font-baron text-[#bf53eb] tracking-wide
              text-xl text-center  max-w-[60%]
            '
						title='крупнейший магазин пиротехники'
					>
						крупнейший магазин пиротехники
					</h2>

					<div
						className='
              font-baron text-[#625a51] text-[18px]
              text-right  max-w-[40%] mr-[46px]
            '
						title='ип федяков и.в.'
					>
						ип федяков и.в.
					</div>
				</div>

				{/* Разделитель */}
				<div className='mx-auto my-4 h-[2px] rounded-[20px] bg-[#efebe6] w-[min(1200px,calc(100%-40px))]' />

				{/* Нижняя строка: ЛОГОТИП + ПОИСК В ОДНУ СТРОКУ */}
				<div className='flex items-center  gap-15 ml-[79px]'>
					<a href='/' className='shrink-0'>
						<Logotip />
					</a>

					{/* Поиск/правый слот — справа, в ту же строку */}
					<div className='flex-1 min-w-0 flex '>
						{/* ограничиваем ширину под SearchHeader */}
						<div className='w-full max-w-[665px]'>{rightSlot}</div>
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
