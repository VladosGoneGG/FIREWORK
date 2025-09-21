import { Link } from 'react-router-dom'
import PressableButton from '../PressableButton/PressableButton'

const NotFoundPage = () => {
	return (
		<div className='w-[1240px] mx-auto h-[907px]  bg-white rounded-b-[20px] flex flex-col justify-start items-center '>
			<p
				className='text-transparent text-[350px] h-[470px]  font-baron'
				style={{ WebkitTextStroke: '4px #625a51' }}
			>
				404
			</p>
			<div className='flex flex-col justify-center items-center'>
				<h1 className='font-baron text-[40px] text-[#625A51] mb-1'>
					кажется страница потерялась
				</h1>
				<p className='text-[20px] text-[#625A51] font-baron'>
					но она догадывается, что ее ищут...
				</p>
			</div>
			<Link to={'/'}>
				<PressableButton className='btn-firework w-[220px] h-[50px] text-[15px] font-baron tracking-wide  mt-[20px]'>
					найти страницу
				</PressableButton>
			</Link>
		</div>
	)
}

export default NotFoundPage
