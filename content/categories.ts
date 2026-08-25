// Static reference data — ported from src/mocks/mockCategories.js. No
// randomness involved, so nothing to make deterministic here.

import { slugify } from '@/lib/slugify'

export interface Subcategory {
	id: number
	name: string
}

export interface Category {
	id: number
	name: string
	slug: string
	subcategories: Subcategory[]
}

const raw: Omit<Category, 'slug'>[] = [
	{ id: 0, name: 'все', subcategories: [] },
	{
		id: 1,
		name: 'салюты',
		subcategories: [
			{ id: 101, name: '0.8–1.0″ (малый калибр)' },
			{ id: 102, name: '1.2″' },
			{ id: 103, name: '1.5″' },
			{ id: 104, name: '2.0″ и выше' },
		],
	},
	{
		id: 2,
		name: 'римские свечи',
		subcategories: [
			{ id: 201, name: '5–8 выстрелов' },
			{ id: 202, name: '9–16 выстрелов' },
			{ id: 203, name: '20+ выстрелов' },
		],
	},
	{
		id: 3,
		name: 'фонтаны',
		subcategories: [
			{ id: 301, name: 'уличные' },
			{ id: 302, name: 'для помещений' },
			{ id: 303, name: 'вулкан' },
			{ id: 304, name: 'долгоиграющие' },
		],
	},
	{
		id: 4,
		name: 'петарды',
		subcategories: [
			{ id: 401, name: 'мини' },
			{ id: 402, name: 'средние' },
			{ id: 403, name: 'мощные' },
			{ id: 404, name: 'ленты / корсары' },
		],
	},
	{
		id: 5,
		name: 'вертушки',
		subcategories: [
			{ id: 501, name: 'наземные' },
			{ id: 502, name: 'воздушные' },
			{ id: 503, name: 'с искрами' },
		],
	},
	{
		id: 6,
		name: 'хлопушки',
		subcategories: [
			{ id: 601, name: 'с конфетти' },
			{ id: 602, name: 'с серпантином' },
			{ id: 603, name: 'пневматические' },
			{ id: 604, name: 'пружинные' },
		],
	},
	{
		id: 7,
		name: 'бенгальские свечи',
		subcategories: [
			{ id: 701, name: '16 см' },
			{ id: 702, name: '25 см' },
			{ id: 703, name: '40 см' },
			{ id: 704, name: '70 см' },
		],
	},
	{
		id: 8,
		name: 'ракеты и фестивальные шары',
		subcategories: [
			{ id: 801, name: 'ракеты — малые' },
			{ id: 802, name: 'ракеты — средние' },
			{ id: 803, name: 'ракеты — большие' },
			{ id: 804, name: 'фестивальные шары 1.2″' },
			{ id: 805, name: 'фестивальные шары 1.5″' },
		],
	},
]

export const categories: Category[] = raw.map(c => ({
	...c,
	slug: c.name === 'все' ? 'all' : slugify(c.name),
}))

export default categories
