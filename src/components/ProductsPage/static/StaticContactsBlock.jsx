const StaticContactsBlock = () => {
	return (
		<div
			className='
				bg-white 
				flex flex-col justify-start items-center
				
			'
		>
			{/* Мобильный хедер — на всю ширину */}
			{/* <div className='hidden max-[1040px]:block w-full'>
				<HeaderMobile />
			</div> */}

			{/* Контент */}
			<div
				className='
					max-w-[1240px] mx-auto h-full bg-white
					flex flex-col justify-center items-center
					
					/* мобильная раскладка: левое выравнивание и растяжение */
					
					
				'
			>
				{/* Первый блок: по левому краю на мобилке */}
				<div
					className='
						flex flex-col gap-[60px] justify-start items-center font-baron
					
					'
				>
					<div className='w-full'>
						<p className='text-[18px] text-[#625a51]'>контакты:</p>
						<ul className='mt-[15px]'>
							<li>
								<span className='text-[14px] text-[#b4b4b4]'>тел:</span>{' '}
								<a
									className='text-[16px] text-[#bd52e9]'
									href='tel:+79036067208'
								>
									+7 (903) 606-72-08
								</a>{' '}
							</li>
							<li>
								<span className='text-[14px] text-[#b4b4b4]'>тел:</span>{' '}
								<a
									className='text-[16px] text-[#bd52e9]'
									href='tel:+79051942193'
								>
									+7 (905) 194-21-93
								</a>{' '}
							</li>
						</ul>

						<p className='text-[18px] text-[#625a51] mt-[20px]'>адрес:</p>
						<ul className='mt-[15px]'>
							<li className='text-[16px] text-[#625a51]'>
								<span className='text-[14px] text-[#b4b4b4]'>город:</span>{' '}
								нижний новгород
							</li>
							<li className='text-[16px] text-[#625a51]'>
								<span className='text-[14px] text-[#b4b4b4]'>адрес:</span>{' '}
								каховская 1А/С
							</li>
						</ul>

						<div className='flex text-[14px] text-[#bd52e9] mt-[15px] pl-[6px]'>
							<span className='relative top-1 right-1'>
								<svg
									width='15'
									height='15'
									viewBox='0 0 18 18'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M2.34131 6.76403L13.5056 1.44847C15.1334 0.672961 16.832 2.37237 16.0573 4.00093L10.7414 15.1634C10.0146 16.6886 7.8124 16.5948 7.21876 15.0121L6.23638 12.3898C6.14039 12.134 5.99075 11.9016 5.79753 11.7084C5.6043 11.5152 5.37196 11.3656 5.11611 11.2696L2.49259 10.2864C0.910822 9.69276 0.81603 7.4907 2.34131 6.76403Z'
										stroke='#BD52E9'
										strokeWidth='2.5'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</span>
							построить маршрут
						</div>
					</div>

					<div className='max-[1040px]:w-full'>
						<p className='text-[18px] text-[#625a51]'>
							ип федяков иван <br />
							владимирович
						</p>
						<ul className='mt-[20px]'>
							<li className='text-[16px] text-[#625a51]'>
								<span className='text-[14px] text-[#b4b4b4]'>огрнип:</span>{' '}
								318527500123530
							</li>
							<li className='text-[16px] text-[#625a51]'>
								<span className='text-[14px] text-[#b4b4b4]'>инн:</span>{' '}
								525804761498
							</li>
							<li className='text-[16px] text-[#625a51]'>
								<span className='text-[14px] text-[#b4b4b4]'>
									дата регистрации:
								</span>{' '}
								4 октября 2018 г.
							</li>
							<li className='text-[16px] text-[#625a51]'>
								<span className='text-[14px] text-[#b4b4b4]'>адрес:</span>
								<br />
								нижнегородская область, город <br /> нижний новгород, ул.{
									''
								}{' '}
								лоцманская 2а
							</li>
						</ul>
						<p className='text-[14px] text-[#bd52e9] mt-[15px]'>
							сертификат профессионального <br />
							пиротехника
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StaticContactsBlock
