import PressableButton from '../PressableButton/PressableButton'

export default function ErrorPage500() {
	return (
		<div>
			<div className='w-[1240px] mx-auto h-[907px]  bg-white rounded-b-[20px] flex flex-col justify-start items-center '>
				<p
					className='text-transparent text-[350px] h-[470px] font-baron'
					style={{ WebkitTextStroke: '4px #625a51' }}
				>
					505
				</p>
				<div className='flex flex-col justify-center items-center'>
					<h1 className='font-baron text-[40px] text-[#625A51] mb-1'>
						кажется сайт устал и прилег отдохнуть
					</h1>
					<p className='text-[20px] text-[#625A51] font-baron'>
						но мы его скоро разбудим...
					</p>
				</div>
				<PressableButton
					onClick={() => window.location.reload()}
					className='btn-firework w-[220px] h-[50px] text-[15px] font-baron tracking-wide  mt-[20px]'
				>
					разбудить сайт
				</PressableButton>
			</div>
			<div className='mt-[50px] text-center font-baron text-[#625A51]'>
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
