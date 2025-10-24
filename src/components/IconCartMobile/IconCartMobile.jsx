import { memo } from 'react'

function IconCartMobile({ count = 0, onClick }) {
	const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0
	const hasItems = safeCount > 0

	return (
		<button
			type='button'
			onClick={onClick}
			className={[
				'relative group w-[50px] h-[50px] rounded-[20px] cursor-pointer',
				'active:-translate-y-[2px] transition-transform duration-150',
				hasItems ? 'text-white' : 'text-[#BD52E9] hover:text-white',
				'bg-transparent p-0 m-0 border-0 focus:outline-none',
			].join(' ')}
			aria-label='Открыть корзину'
			title='Открыть корзину'
		>
			{/* фон + иконка внутри скругления */}
			<span className='absolute inset-0 rounded-[20px] overflow-hidden'>
				<svg
					className='block w-full h-full'
					viewBox='0 0 50 50'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
					aria-hidden='true'
				>
					<rect width='50' height='50' rx='20' fill='white' />
					<rect
						width='50'
						height='50'
						rx='20'
						className={[
							'transition-opacity duration-150',
							hasItems ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
						].join(' ')}
						fill='url(#paint0_radial_cart)'
					/>
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M30.2569 13.3052L32.5843 18.0854H35.8C36.5161 18.0854 37.2028 18.3776 37.7092 18.8977C38.2155 19.4178 38.5 20.1233 38.5 20.8589V22.2456C38.5001 22.7743 38.3531 23.2919 38.0764 23.7376C37.7997 24.1833 37.4047 24.5384 36.9381 24.7612L34.8874 34.2425C34.6875 35.1663 34.1869 35.9926 33.4683 36.5848C32.7496 37.177 31.8559 37.4998 30.9346 37.5H19.0654C18.1439 37.4998 17.25 37.1767 16.5314 36.5842C15.8127 35.9917 15.3123 35.1652 15.1126 34.2411L13.0606 24.7612C12.5942 24.5382 12.1995 24.183 11.923 23.7373C11.6466 23.2916 11.4998 22.7741 11.5 22.2456V20.8589C11.5 20.1233 11.7845 19.4178 12.2908 18.8977C12.7972 18.3776 13.4839 18.0854 14.2 18.0854H17.4157L19.7431 13.3052C19.9096 12.988 20.1898 12.7499 20.5243 12.6412C20.8588 12.5325 21.2213 12.5619 21.5351 12.7231C21.8489 12.8842 22.0892 13.1645 22.2053 13.5046C22.3214 13.8447 22.304 14.2178 22.1569 14.545L20.4343 18.0854H29.5657L27.8431 14.545C27.7573 14.3815 27.7043 14.202 27.6873 14.0171C27.6703 13.8322 27.6897 13.6457 27.7442 13.4686C27.7987 13.2915 27.8873 13.1275 28.0047 12.9863C28.1221 12.845 28.2659 12.7295 28.4276 12.6464C28.5893 12.5633 28.7656 12.5145 28.9461 12.5028C29.1265 12.491 29.3074 12.5167 29.478 12.5781C29.6486 12.6395 29.8055 12.7356 29.9393 12.8605C30.0731 12.9854 30.1811 13.1366 30.2569 13.3052ZM34.1179 25.0192H15.8821L17.7464 33.6406C17.8131 33.9486 17.98 34.224 18.2195 34.4214C18.459 34.6188 18.7569 34.7264 19.0641 34.7265H30.9333C31.2404 34.7264 31.5383 34.6188 31.7778 34.4214C32.0173 34.224 32.1842 33.9486 32.2509 33.6406L34.1179 25.0192ZM35.8 20.8589H14.2V22.2456H35.8V20.8589Z'
						fill='currentColor'
					/>
					<defs>
						<radialGradient
							id='paint0_radial_cart'
							cx='0'
							cy='0'
							r='1'
							gradientUnits='userSpaceOnUse'
							gradientTransform='matrix(71.0526 50 -3.4626 71.0526 -6.57895 0)'
						>
							<stop stopColor='#1D0353' />
							<stop offset='1' stopColor='#C054EB' />
						</radialGradient>
					</defs>
				</svg>
			</span>

			{/* бейдж — показываем только если есть товары */}
			{hasItems && (
				<span
					className={[
						'absolute -top-[2px] -right-[2px] z-20',
						'w-[18px] h-[18px] rounded-full bg-white',
						'grid place-items-center shadow-[0px_1px_3px_rgba(0,0,0,0.15)]',
						'text-[11px] leading-none font-baron',
					].join(' ')}
					aria-hidden='true'
				>
					{/* градиентный текст (а не color) */}
					<span
						className='block'
						style={{
							backgroundImage:
								'radial-gradient(142.27% 173.76% at -13.16% 0%, #1D0353 0%, #C054EB 100%)',
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
							WebkitTextFillColor: 'transparent',
							fontSize: 12,
							lineHeight: '12px',
						}}
					>
						{safeCount}
					</span>
				</span>
			)}
		</button>
	)
}

export default memo(IconCartMobile)
