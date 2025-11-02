// src/store/mock/mockProducts.js
import fullBlockSvg from '../../public/SVG/full-block.svg'

const MFR = ['PIROFF', 'Joker', 'Maxsem', 'РусСалют', 'Fieria']
const IGNITIONS = ['терочный', 'ударный', 'фитильный']
const VIEWS_GENERIC = [
	'жуки',
	'лента',
	'треугольник',
	'чесночок',
	'шарик',
	'хлопушка',
]
const SIZES = ['маленький', 'большой']
const POWERS = ['слабый', 'мощный']
const PETARDA_SHOTS = [1, 2, 3, 4, 50, 100]

const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

// короткий «российский» номер сертификата
const CERT_PREFIX = ['ЕАЭС RU C-RU', 'ТР ТС RU C-RU']
const CERT_BLOCK = ['АЮ', 'МЮ', 'АН', 'АЯ', 'ДМ']
const makeCertNum = () => {
	const num = String(rnd(10000, 99999))
	const year = String(rnd(23, 26))
	const block = pick(CERT_BLOCK)
	const pref = pick(CERT_PREFIX)
	return `${pref}.${block}.В.${num}/${year}` // напр.: ЕАЭС RU C-RU.АЮ.В.12345/24
}

// === фабрика товара ===
const makeProduct = (id, name, category, subcategory, overrides = {}) => {
	const basePrice = rnd(500, 3499)
	const hasDiscount = Math.random() > 0.5
	let discountPrice = null
	if (hasDiscount) {
		const discountPct = 0.1 + Math.random() * 0.3
		discountPrice = Math.max(1, Math.floor(basePrice * (1 - discountPct)))
		if (discountPrice >= basePrice) discountPrice = basePrice - 1
	}

	const manufacturer = pick(MFR)
	const ignitionType = pick(IGNITIONS)
	const view = pick(VIEWS_GENERIC)
	const size = pick(SIZES)
	const power = pick(POWERS)

	const isPetardy = String(category).toLowerCase() === 'петарды'
	const shots = isPetardy ? pick(PETARDA_SHOTS) : rnd(10, 120)
	const durationSec = rnd(20, 120)

	const tags = Array.from(
		new Set(
			[
				category,
				subcategory,
				manufacturer,
				ignitionType,
				view,
				size,
				power,
				...String(name)
					.toLowerCase()
					.split(/[^\p{L}\p{N}\-]+/u),
			]
				.map(s =>
					String(s || '')
						.trim()
						.toLowerCase()
				)
				.filter(Boolean)
		)
	)

	// ~80% товаров с номером, остальные без (для проверки фильтра)
	const certificateNumber = Math.random() > 0.2 ? makeCertNum() : ''

	return {
		id,
		name,
		manufacturer,
		category,
		subcategory,
		shots,
		caliber: (Math.random() * 1.5 + 0.8).toFixed(1),
		durationSec,
		effectsCount: rnd(1, 10),
		certificateNumber, // <-- номер сертификата (текст)
		stock: rnd(1, 50),
		price: basePrice,
		discountPrice,
		images: [fullBlockSvg],
		video: null,
		description: 'Описание товара: яркие спецэффекты и насыщенные цвета.',
		ignitionType,
		view,
		size,
		power,
		tags,
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

// петарды — здесь shots из PETARDA_SHOTS
;['мини', 'средние', 'мощные', 'ленты / корсары'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(id++, `Петарда — ${sub} #${i + 1}`, 'петарды', sub, {
				shots: pick(PETARDA_SHOTS),
			})
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

// ракеты и фестивальные шары
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
