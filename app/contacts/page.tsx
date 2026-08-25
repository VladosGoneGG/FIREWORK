import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Контакты',
	description: 'Контакты, адрес и реквизиты ИП Федяков Иван Владимирович.',
	alternates: { canonical: '/contacts' },
}

export default function ContactsPage() {
	return (
		<div className="mx-auto flex max-w-[720px] flex-col gap-8 rounded-2xl bg-white p-6 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">
			<div className="font-baron space-y-3">
				<p className="text-lg text-[#625a51]">контакты:</p>
				<ul className="space-y-1">
					<li>
						<span className="text-sm text-[#b4b4b4]">тел:</span>{' '}
						<a className="text-[#bd52e9]" href="tel:+79036067208">
							+7 (903) 606-72-08
						</a>
					</li>
					<li>
						<span className="text-sm text-[#b4b4b4]">тел:</span>{' '}
						<a className="text-[#bd52e9]" href="tel:+79051942193">
							+7 (905) 194-21-93
						</a>
					</li>
				</ul>

				<p className="text-lg text-[#625a51]">адрес:</p>
				<ul className="space-y-1 text-[#625a51]">
					<li>
						<span className="text-sm text-[#b4b4b4]">город:</span> нижний новгород
					</li>
					<li>
						<span className="text-sm text-[#b4b4b4]">адрес:</span> каховская 1А/С
					</li>
				</ul>

				<a
					href="https://yandex.ru/maps/-/CLG7jLpF"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-block text-sm text-[#bd52e9] hover:underline"
				>
					построить маршрут →
				</a>
			</div>

			<div className="font-baron space-y-3">
				<p className="text-lg text-[#625a51]">
					ип федяков иван владимирович
				</p>
				<ul className="space-y-1 text-[#625a51]">
					<li>
						<span className="text-sm text-[#b4b4b4]">огрнип:</span> 318527500123530
					</li>
					<li>
						<span className="text-sm text-[#b4b4b4]">инн:</span> 525804761498
					</li>
					<li>
						<span className="text-sm text-[#b4b4b4]">дата регистрации:</span> 4 октября 2018 г.
					</li>
					<li>
						<span className="text-sm text-[#b4b4b4]">адрес:</span> нижегородская область,
						город нижний новгород, ул. лоцманская 2а
					</li>
				</ul>
				<p className="text-sm text-[#bd52e9]">сертификат профессионального пиротехника</p>
			</div>
		</div>
	)
}
