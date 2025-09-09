const makeProduct = (id, name, category, subcategory, overrides = {}) => ({
	id,
	name,
	manufacturer: 'PIROFF',
	category,
	subcategory,
	shots: Math.floor(Math.random() * 100) + 10,
	caliber: (Math.random() * 1.5 + 0.8).toFixed(1), // 0.8 – 2.3"
	durationSec: Math.floor(Math.random() * 80) + 20,
	effectsCount: Math.floor(Math.random() * 10) + 1,
	certificateUrl: './certs/salut100.pdf',
	stock: Math.floor(Math.random() * 50) + 1,
	price: Math.floor(Math.random() * 3000) + 500,
	discountPrice:
		Math.random() > 0.5 ? Math.floor(Math.random() * 2500) + 400 : null,
	images: ['./src/assets/SVG/full-block.svg'],
	video: null,
	description: 'Описание товара: яркие спецэффекты и насыщенные цвета.',
	...overrides,
})

// Собираем массив по категориям/подкатегориям
const mockProducts = []

let id = 1

// Салюты
;['Батареи салютов', 'Мортиры', 'Ракеты'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(makeProduct(id++, `${sub} #${i + 1}`, 'Салюты', sub))
	}
})

// Фонтаны
;['Уличные', 'Для помещений'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(
			makeProduct(id++, `${sub} фонтан #${i + 1}`, 'Фонтаны', sub)
		)
	}
})

// Свечи
;['Римские свечи', 'Бенгальские огни', 'Тортовые свечи'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(makeProduct(id++, `${sub} #${i + 1}`, 'Свечи', sub))
	}
})

// Хлопушки
for (let i = 0; i < 5; i++) {
	mockProducts.push(makeProduct(id++, `Хлопушка #${i + 1}`, 'Хлопушки', ''))
}

// Шоу
;['Профессиональные', 'Домашние наборы'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(makeProduct(id++, `${sub} шоу #${i + 1}`, 'Шоу', sub))
	}
})

// Аксессуары
;['Запалы', 'Фитили'].forEach(sub => {
	for (let i = 0; i < 5; i++) {
		mockProducts.push(makeProduct(id++, `${sub} #${i + 1}`, 'Аксессуары', sub))
	}
})

export default mockProducts
