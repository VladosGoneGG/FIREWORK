// mockProducts.js
import fullBlockSvg from '../../public/SVG/full-block.svg'

// === фабрика товара (должна быть объявлена ДО использования) ===
const makeProduct = (id, name, category, subcategory, overrides = {}) => {
	const basePrice = Math.floor(Math.random() * 3000) + 500 // 500..3499
	const hasDiscount = Math.random() > 0.5
	let discountPrice = null

	if (hasDiscount) {
		const discountPct = 0.1 + Math.random() * 0.3 // 10%..40%
		discountPrice = Math.max(1, Math.floor(basePrice * (1 - discountPct)))
		if (discountPrice >= basePrice) discountPrice = basePrice - 1
	}

	return {
		id,
		name,
		manufacturer: 'PIROFF',
		category, // строка категории (низкий регистр, см. ниже)
		subcategory, // строка подкатегории
		shots: Math.floor(Math.random() * 100) + 10,
		caliber: (Math.random() * 1.5 + 0.8).toFixed(1),
		durationSec: Math.floor(Math.random() * 80) + 20,
		effectsCount: Math.floor(Math.random() * 10) + 1,
		certificateUrl: './certs/salut100.pdf',
		stock: Math.floor(Math.random() * 50) + 1,
		price: basePrice,
		discountPrice, // либо число, либо null
		images: [fullBlockSvg],
		video: null,
		description: 'Описание товара: яркие спецэффекты и насыщенные цвета.',
		...overrides,
	}
}

// === сборка массива по актуальным категориям ===
const mockProducts = []
let id = 1

// салюты
;['0.8–1.0″ (малый калибр)', '1.2″', '1.5″', '2.0″ и выше'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(makeProduct(id++, `${sub} #${i + 1}`, 'салюты', sub))
	}
})

// римские свечи
;['5–8 выстрелов', '9–16 выстрелов', '20+ выстрелов'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(
				id++,
				`${sub} — римская свеча #${i + 1}`,
				'римские свечи',
				sub
			)
		)
	}
})

// фонтаны
;['уличные', 'для помещений', 'вулкан', 'долгоиграющие'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(id++, `${sub} фонтан #${i + 1}`, 'фонтаны', sub)
		)
	}
})

// петарды
;['мини', 'средние', 'мощные', 'ленты / корсары'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(id++, `Петарда — ${sub} #${i + 1}`, 'петарды', sub)
		)
	}
})

// вертушки
;['наземные', 'воздушные', 'с искрами'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(id++, `Вертушка — ${sub} #${i + 1}`, 'вертушки', sub)
		)
	}
})

// хлопушки
;['с конфетти', 'с серпантином', 'пневматические', 'пружинные'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(id++, `Хлопушка — ${sub} #${i + 1}`, 'хлопушки', sub)
		)
	}
})

// бенгальские свечи
;['16 см', '25 см', '40 см', '70 см'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(
				id++,
				`Бенгальская свеча ${sub} #${i + 1}`,
				'бенгальские свечи',
				sub
			)
		)
	}
})

// ракеты и фестивальные шары (единая категория)
;[
	'ракеты — малые',
	'ракеты — средние',
	'ракеты — большие',
	'фестивальные шары 1.2″',
	'фестивальные шары 1.5″',
].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(
				id++,
				`${sub
					.replace('ракеты — ', 'Ракета ')
					.replace('фестивальные шары', 'Фест. шары')} #${i + 1}`,
				'ракеты и фестивальные шары',
				sub
			)
		)
	}
})

export default mockProducts
