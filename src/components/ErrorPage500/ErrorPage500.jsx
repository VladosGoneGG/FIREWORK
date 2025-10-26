import HeaderMobile from '../LayoutMobile/parts/HeaderMobile'

export default function ErrorPage500() {
	return (
		<div
			className='
				max-[1040px]:min-h-[100dvh]
				max-[1040px]:flex max-[1040px]:flex-col
			'
		>
			<div className='hidden max-[1040px]:block'>
				<HeaderMobile />
			</div>
			<div
				className='
					max-w-[1240px] mx-auto h-[907px] bg-white rounded-b-[20px]
					flex flex-col justify-start items-center
					/* мобильная раскладка во всю высоту без зазора снизу */
					max-[1040px]:w-full
					max-[1040px]:h-auto
					max-[1040px]:flex-1
					max-[1040px]:justify-center
					max-[1040px]:py-6
					max-[1040px]:gap-4
					max-[1040px]:text-center
				'
			>
				<p
					className='
						text-transparent text-[350px] h-[470px] font-baron
						max-[1040px]:mb-[60px]
						max-[1040px]:text-[150px]
						max-[1040px]:h-auto
						max-[1040px]:leading-none
						max-[1040px]:select-none
					'
					style={{ WebkitTextStroke: '4px #625a51' }}
				>
					505
				</p>

				<div className='flex flex-col justify-center items-center px-2 max-[1040px]:max-w-[259px]'>
					<h1 className='font-baron text-[40px] text-[#625A51] max-[1040px]:text-[20px]'>
						кажется сайт устал и прилег отдохнуть
					</h1>
					<p className='text-[20px] text-[#625A51] font-baron max-[1040px]:text-[14px]'>
						но мы его скоро разбудим...
					</p>
				</div>

				<button
					onClick={() => window.location.reload()}
					className='
    rounded-[10px] w-[275px] h-[50px] text-[15px] font-baron tracking-wide mt-[50px]
    transition-colors duration-150 ease-out cursor-pointer
    btn-firework
    max-[1040px]:w-full
    max-[1040px]:max-w-[259px]
    max-[1040px]:h-[64px]
    max-[1040px]:mt-[38px]
    max-[1040px]:text-[20px]
    max-[1040px]:rounded-[20px]
  '
				>
					<span className='relative z-[1]'>Разбудить сайт</span>
				</button>
				<div className='hidden w-[233px] mt-[77px] text-[#625A51]  font-baron max-[1040px]:flex'>
					<p className='text-[14px]'>
						если у вас не получилось разбудить сайт{' '}
						<a
							href='https://t.me/your_username'
							target='_blank'
							rel='noopener noreferrer'
							className='text-[#bd52e9]'
						>
							свяжитесь с нами
						</a>{' '}
						и мы заставим его работать!
					</p>
				</div>
			</div>

			{/* Футер на мобильных скрыт — как у тебя */}
			<div className='mt-[50px] text-center font-baron text-[#625A51] max-[1040px]:hidden'>
				<p className='text-[20px]'>
					если у вас не получилось разбудить сайт{' '}
					<a
						href='https://t.me/your_username'
						target='_blank'
						rel='noopener noreferrer'
						className='text-[#59AFED]'
					>
						свяжитесь с нами
					</a>{' '}
					и мы заставим его работать!
				</p>
			</div>
		</div>
	)
}
