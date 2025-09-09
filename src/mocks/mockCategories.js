const mockCategories = [
	{ id: 0, name: 'все', subcategories: [] },

	{
		id: 1,
		name: 'салюты',
		subcategories: [
			{ id: 11, name: 'батареи салютов' },
			{ id: 12, name: 'мортиры' },
			{ id: 13, name: 'ракеты' },
		],
	},

	{
		id: 2,
		name: 'Фонтаны',
		subcategories: [
			{ id: 21, name: 'уличные' },
			{ id: 22, name: 'для помещений' },
		],
	},

	{
		id: 3,
		name: 'свечи',
		subcategories: [
			{ id: 31, name: 'римские свечи' },
			{ id: 32, name: 'бенгальские огни' },
			{ id: 33, name: 'тортовые свечи' },
		],
	},

	{ id: 4, name: 'хлопушки', subcategories: [] },

	{
		id: 5,
		name: 'шоу',
		subcategories: [
			{ id: 51, name: 'профессиональные' },
			{ id: 52, name: 'домашние наборы' },
		],
	},

	{
		id: 6,
		name: 'аксессуары',
		subcategories: [
			{ id: 61, name: 'запалы' },
			{ id: 62, name: 'фитили' },
		],
	},
]

export default mockCategories
