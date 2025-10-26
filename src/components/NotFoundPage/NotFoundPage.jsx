import { Link } from 'react-router-dom'
import PressableButton from '../PressableButton/PressableButton'

const NotFoundPage = () => {
	return (
		<div
			className='
				/* только для мобильных/узких: тянуться на всю высоту окна */
				max-[1040px]:min-h-[100dvh]
				max-[1040px]:flex max-[1040px]:flex-col
			'
		>
			<div
				className='
					w-[1240px] mx-auto h-[907px] bg-white rounded-b-[20px]
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
					404
				</p>

				<div className='flex flex-col justify-center items-center  max-[1040px]:max-w-[270px] [1040px]:h-[54px] '>
					<h1 className='font-baron text-[40px]  text-[#625A51]  max-[1040px]:text-[20px]  max-[1040px]:leading-5'>
						кажется страница потерялась
					</h1>
					<p className='text-[20px] text-[#625A51] font-baron max-[1040px]:text-[14px] leading-2 max-[1040px]:mt-2.5'>
						но она догадывается, что ее ищут...
					</p>
				</div>

				<Link to='/' className='max-[1040px]:w-full max-[1040px]:max-w-[259px]'>
					<PressableButton
						className='
							btn-firework w-[220px] h-[50px] text-[15px] font-baron tracking-wide mt-[50px]
							/* мобильные параметры как на 505 */
							max-[1040px]:w-full
							max-[1040px]:h-[64px]
							max-[1040px]:mt-[38px]
							max-[1040px]:text-[20px]
							max-[1040px]:rounded-[20px]
						'
					>
						<span className='relative z-[1]'>найти страницу</span>
					</PressableButton>
				</Link>
			</div>
		</div>
	)
}

export default NotFoundPage
