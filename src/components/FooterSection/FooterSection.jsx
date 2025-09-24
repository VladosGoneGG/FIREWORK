const FooterSection = () => {
	return (
		<footer
			className='
       bg-[#efebe6] pt-[20px] pl-[31px] mb-10 w-full min-h-[100px]'
		>
			<div className='flex gap-[59px] text-[12px] font-bold  text-[#625a51] font-inter tracking-wider'>
				<div>
					<ul className='uppercase flex flex-col gap-[10px]  '>
						<li>контакты</li>
						<li>условия доставки</li>
						<li>оптовикам</li>
					</ul>
				</div>
				<div>
					<ul className='uppercase flex flex-col gap-[10px] '>
						<li>сертификат профессионального пиротехника</li>
						<li>ип федяков иван владимирович</li>
						<li className=' text-[#d2cecb] '>
							г. нижний новгород, ул. лоцманская 2а
						</li>
					</ul>
				</div>
			</div>
		</footer>
	)
}
export default FooterSection
