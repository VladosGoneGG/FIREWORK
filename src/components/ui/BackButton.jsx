// src/components/ui/BackButton.jsx
import { memo } from 'react'

const BackButton = ({
	children = 'назад',
	onClick,
	disabled = false,
	className = '',
}) => {
	// классы по состояниям
	const overlayBg = disabled
		? 'bg-stone-200'
		: 'bg-white group-hover:bg-purple-500 group-active:bg-[#efebe7]'
	const textClr = disabled
		? 'text-stone-600'
		: 'text-black group-hover:text-white group-active:text-[#625a51]'
	const arrowClr = disabled
		? 'bg-stone-600'
		: 'bg-purple-500 group-hover:bg-white group-active:bg-[#625a51]'

	return (
		// МАСКА: режет антиалиас-пиксель на скруглении
		<div
			className={[
				'inline-block w-24 h-7',
				'rounded-tl-[10px] rounded-br-[10px]',
				'overflow-hidden', // ключ
				className,
			].join(' ')}
		>
			<button
				type='button'
				onClick={onClick}
				disabled={disabled}
				aria-label='Назад'
				title='Назад'
				className={[
					'relative w-full h-full',
					'inline-flex items-center justify-center gap-2.5 cursor-pointer',
					'bg-transparent', // фон управляется overlay-спаном ниже
					'leading-none select-none antialiased',
					'focus:outline-none',
					'group', // для hover/active на потомках
				].join(' ')}
			>
				{/* overlay-фон: default/hover/active/disabled */}
				<span
					className={[
						'absolute inset-0 pointer-events-none transition-colors',
						overlayBg,
					].join(' ')}
				/>

				{/* Контент поверх */}
				<span className='relative z-10 inline-flex items-center gap-2.5'>
					{/* Левая зона со стрелкой */}
					<span className='w-6 h-6 px-[5px] py-1.5 flex items-center justify-center shrink-0'>
						{/* Стрелка 1:1 из фигмы: треугольник ← через clip-path */}
						<span className='w-3.5 h-3.5 relative overflow-hidden'>
							<span
								className={[
									'absolute left-[2.18px] top-[1.08px] w-2 h-2.5',
									'[clip-path:polygon(0%_50%,100%_0,100%_100%)]',
									'transition-colors',
									arrowClr,
								].join(' ')}
							/>
						</span>
					</span>

					{/* Текст: центр по вертикали; при необходимости подними/опусти на 0.5px */}
					<span
						className={[
							'w-[35px] h-6 flex items-center text-xs font-baron leading-none',
							textClr,
							'-translate-y-[0.5px]',
						].join(' ')}
					>
						{children}
					</span>
				</span>
			</button>
		</div>
	)
}

export default memo(BackButton)
