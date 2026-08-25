// Deterministic product fixture — ported from src/mocks/mockProducts.js.
//
// Two changes from the old fixture, both deliberate:
//
// 1. Math.random() is replaced with a seeded PRNG. The old fixture
//    regenerated random data on every module load, which is harmless in a
//    client-only Vite app but guarantees a hydration mismatch under SSR
//    (server and client would each roll different numbers). A fixed seed
//    makes every run — server render, client hydration, every test —
//    produce byte-identical output.
//
// 2. No `power` field. The old fixture assigned it via pick(['слабый',
//    'мощный']), independent of every other field. Checked against the
//    generated catalogue: 96 of 155 products (62%) disagree with the
//    calibre-derived bucket the mobile filter used instead, and the
//    average caliber for power==="слабый" (1.533) is actually *higher*
//    than for power==="мощный" (1.470) — the field is random noise, not a
//    real signal, and the site's own established taxonomy for "салюты"
//    subcategories is already caliber-based (0.8–1.0″, 1.2″, 1.5″, 2.0″+).
//    "power" is now always derived from caliber — see lib/filters.ts.
//
// This whole module is the mock adapter behind the catalogue boundary in
// lib/catalogue.ts. Nothing outside lib/catalogue.ts should import it
// directly — swapping in a real data source later means replacing that
// one file, not touching call sites.

export interface Product {
	id: number
	slug: string
	name: string
	manufacturer: string
	category: string
	subcategory: string
	shots: number
	caliber: number
	durationSec: number
	effectsCount: number
	certificateNumber: string
	stock: number
	price: number
	discountPrice: number | null
	images: string[]
	video: string | null
	description: string
	ignitionType: string
	view: string
	size: string
	tags: string[]
}

// ================== Seeded PRNG (mulberry32) ==================
function mulberry32(seed: number) {
	let a = seed
	return function random() {
		a |= 0
		a = (a + 0x6d2b79f5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

const random = mulberry32(20260825) // fixed seed — see module docblock

const pick = <T,>(arr: T[]): T => arr[Math.floor(random() * arr.length)]
const rnd = (a: number, b: number) => Math.floor(random() * (b - a + 1)) + a

// ================== Transliteration (for readable, stable slugs) ========
const TRANSLIT: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
	и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
	с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
	щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(name: string, id: number): string {
	const translit = name
		.toLowerCase()
		.split('')
		.map(ch => TRANSLIT[ch] ?? ch)
		.join('')
	const kebab = translit
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
	return `${kebab}-${id}`
}

// ================== Vocab ==================
const MFR = ['PIROFF', 'Joker', 'Maxsem', 'РусСалют', 'Fieria']
const IGNITIONS = ['терочный', 'ударный', 'фитильный']
const VIEWS_GENERIC = ['жуки', 'лента', 'треугольник', 'чесночок', 'шарик', 'хлопушка']
const SIZES = ['маленький', 'большой']
const PETARDA_SHOTS = [1, 2, 3, 4, 50, 100]

const CERT_PREFIX = ['ЕАЭС RU C-RU', 'ТР ТС RU C-RU']
const CERT_BLOCK = ['АЮ', 'МЮ', 'АН', 'АЯ', 'ДМ']
const makeCertNum = () => {
	const num = String(rnd(10000, 99999))
	const year = String(rnd(23, 26))
	const block = pick(CERT_BLOCK)
	const pref = pick(CERT_PREFIX)
	return `${pref}.${block}.В.${num}/${year}`
}

function makeProduct(
	id: number,
	name: string,
	category: string,
	subcategory: string,
	overrides: Partial<Product> = {}
): Product {
	const basePrice = rnd(500, 3499)
	const hasDiscount = random() > 0.5
	let discountPrice: number | null = null
	if (hasDiscount) {
		const discountPct = 0.1 + random() * 0.3
		discountPrice = Math.max(1, Math.floor(basePrice * (1 - discountPct)))
		if (discountPrice >= basePrice) discountPrice = basePrice - 1
	}

	const manufacturer = pick(MFR)
	const ignitionType = pick(IGNITIONS)
	const view = pick(VIEWS_GENERIC)
	const size = pick(SIZES)

	const isPetardy = category.toLowerCase() === 'петарды'
	const shots = isPetardy ? pick(PETARDA_SHOTS) : rnd(10, 120)
	const durationSec = rnd(20, 120)
	const caliber = Math.round((random() * 1.5 + 0.8) * 10) / 10

	const tags = Array.from(
		new Set(
			[category, subcategory, manufacturer, ignitionType, view, size]
				.concat(name.toLowerCase().split(/[^\p{L}\p{N}\-]+/u))
				.map(s => String(s || '').trim().toLowerCase())
				.filter(Boolean)
		)
	)

	const certificateNumber = random() > 0.2 ? makeCertNum() : ''

	return {
		id,
		slug: slugify(name, id),
		name,
		manufacturer,
		category,
		subcategory,
		shots,
		caliber,
		durationSec,
		effectsCount: rnd(1, 10),
		certificateNumber,
		stock: rnd(1, 50),
		price: basePrice,
		discountPrice,
		// No fixture image: the old app pointed every product at one shared
		// asset regardless of `images`, which made the whole catalogue look
		// identical (audit finding H13). An empty array is honest about not
		// having real per-product photography yet — the UI's existing
		// "нет фото" placeholder state handles it — rather than repeating
		// that bug with a different shared file. Real images are a content
		// problem for whatever feeds the catalogue (P8 / eventual 1C), not
		// something this mock adapter should fake.
		images: [],
		video: null,
		description: 'Описание товара: яркие спецэффекты и насыщенные цвета.',
		ignitionType,
		view,
		size,
		tags,
		...overrides,
	}
}

const products: Product[] = []
let nextId = 1

const bySub = (
	category: string,
	subs: string[],
	nameFor: (sub: string, i: number) => string,
	overridesFor?: (sub: string) => Partial<Product>
) => {
	for (const sub of subs) {
		for (let i = 0; i < 5; i++) {
			products.push(
				makeProduct(nextId++, nameFor(sub, i), category, sub, overridesFor?.(sub))
			)
		}
	}
}

bySub('салюты', ['0.8–1.0″ (малый калибр)', '1.2″', '1.5″', '2.0″ и выше'], (sub, i) => `${sub} #${i + 1}`)
bySub('римские свечи', ['5–8 выстрелов', '9–16 выстрелов', '20+ выстрелов'], (sub, i) => `${sub} — римская свеча #${i + 1}`)
bySub('фонтаны', ['уличные', 'для помещений', 'вулкан', 'долгоиграющие'], (sub, i) => `${sub} фонтан #${i + 1}`)
bySub(
	'петарды',
	['мини', 'средние', 'мощные', 'ленты / корсары'],
	(sub, i) => `Петарда — ${sub} #${i + 1}`,
	() => ({ shots: pick(PETARDA_SHOTS) })
)
bySub('вертушки', ['наземные', 'воздушные', 'с искрами'], (sub, i) => `Вертушка — ${sub} #${i + 1}`)
bySub('хлопушки', ['с конфетти', 'с серпантином', 'пневматические', 'пружинные'], (sub, i) => `Хлопушка — ${sub} #${i + 1}`)
bySub('бенгальские свечи', ['16 см', '25 см', '40 см', '70 см'], (sub, i) => `Бенгальская свеча ${sub} #${i + 1}`)
bySub(
	'ракеты и фестивальные шары',
	['ракеты — малые', 'ракеты — средние', 'ракеты — большие', 'фестивальные шары 1.2″', 'фестивальные шары 1.5″'],
	(sub, i) =>
		`${sub.replace('ракеты — ', 'Ракета ').replace('фестивальные шары', 'Фест. шары')} #${i + 1}`
)

export { products }
export default products
