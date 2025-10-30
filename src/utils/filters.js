// src/utils/filters.js

const norm = s =>
	String(s || '')
		.trim()
		.toLowerCase()
		.replaceAll('ё', 'е')

const toArr = v => (Array.isArray(v) ? v : v == null ? [] : [v])
const toSet = v => new Set(toArr(v).map(norm))

// shots: как договорились в UI
// 1,2,3,4 — точное совпадение
// 50 — диапазон [50..99]
// 100 — >= 100
function shotsMatch(selected, value) {
	if (!selected || selected.size === 0) return true
	const n = Number(value) || 0
	if (selected.has('1') || selected.has(1)) if (n === 1) return true
	if (selected.has('2') || selected.has(2)) if (n === 2) return true
	if (selected.has('3') || selected.has(3)) if (n === 3) return true
	if (selected.has('4') || selected.has(4)) if (n === 4) return true
	if (selected.has('50') || selected.has(50))
		if (n >= 50 && n < 100) return true
	if (selected.has('100') || selected.has(100)) if (n >= 100) return true
	return false
}

function inRange(val, min, max, userBounded = false) {
	const v = Number(val)
	if (!Number.isFinite(v)) {
		// если пользователь ХОТЬ ЧТО-ТО задал по диапазону — без значения товар не проходит
		return userBounded ? false : true
	}
	if (Number.isFinite(min) && v < min) return false
	if (Number.isFinite(max) && v > max) return false
	return true
}

// Извлекаем «цену для сравнения»: сначала скидочная, потом обычная.
function getComparablePrice(p) {
	const d = Number(p?.discountPrice)
	const base = Number(p?.price)
	if (Number.isFinite(d) && d > 0) return d
	if (Number.isFinite(base) && base > 0) return base
	return NaN
}

// Теги: требуем, чтобы ВСЕ введенные теги были найдены у товара
function tagsMatch(requiredTags, product) {
	const required = toArr(requiredTags).map(norm).filter(Boolean)
	if (!required.length) return true

	// Источники тегов товара: product.tags или derive из семантики
	const productTagsRaw = toArr(product?.tags)
	let productTags = productTagsRaw.length
		? productTagsRaw.map(norm)
		: [
				product?.name,
				product?.manufacturer,
				product?.category,
				product?.subcategory,
				product?.view,
				product?.ignitionType,
				product?.size,
				product?.power,
		  ]
				.flatMap(x => String(x || '').split(/[^\p{L}\p{N}\-]+/u))
				.map(norm)
				.filter(Boolean)

	const bag = new Set(productTags)
	return required.every(t => bag.has(t))
}

/**
 * Главная функция фильтрации
 * @param {Array} items
 * @param {Object} form — структура из SubcategoryOverlay:
 * {
 *   tags: string[],
 *   types: string[],            // по category
 *   manufacturers: string[],
 *   ignitionType: string[],
 *   shots: (1|2|3|4|50|100)[],
 *   power: string[],            // 'слабый' | 'мощный'
 *   view: string[],
 *   size: string[],             // 'маленький' | 'большой'
 *   price: { min, max },
 *   time: { min, max }          // по durationSec
 * }
 */
export function applyAdvancedFilter(items, form = {}) {
	const list = Array.isArray(items) ? items : []
	if (!list.length) return list

	// Подготовили выбранные множества
	const selTypes = toSet(form.types)
	const selMfr = toSet(form.manufacturers)
	const selIgnition = toSet(form.ignitionType)
	const selPower = toSet(form.power)
	const selView = toSet(form.view)
	const selSize = toSet(form.size)

	const selShots = new Set(toArr(form.shots)) // для кастомной функции

	const priceMin = Number(form?.price?.min)
	const priceMax = Number(form?.price?.max)
	const timeMin = Number(form?.time?.min)
	const timeMax = Number(form?.time?.max)

	const priceUserBounded =
		Number.isFinite(priceMin) || Number.isFinite(priceMax)
	const timeUserBounded = Number.isFinite(timeMin) || Number.isFinite(timeMax)

	return list.filter(p => {
		// 1) Цена
		const price = getComparablePrice(p)
		if (
			!inRange(
				price,
				Number.isFinite(priceMin) ? priceMin : undefined,
				Number.isFinite(priceMax) ? priceMax : undefined,
				priceUserBounded
			)
		) {
			return false
		}

		// 2) Время работы (durationSec)
		if (
			!inRange(
				p?.durationSec,
				Number.isFinite(timeMin) ? timeMin : undefined,
				Number.isFinite(timeMax) ? timeMax : undefined,
				timeUserBounded
			)
		) {
			return false
		}

		// 3) Типы (по category)
		if (selTypes.size) {
			const cat = norm(p?.category)
			if (!selTypes.has(cat)) return false
		}

		// 4) Производитель
		if (selMfr.size) {
			const m = norm(p?.manufacturer)
			if (!selMfr.has(m)) return false
		}

		// 5) Тип воспламенения
		if (selIgnition.size) {
			const t = norm(p?.ignitionType)
			if (!selIgnition.has(t)) return false
		}

		// 6) Хлопки
		if (!shotsMatch(selShots, p?.shots)) return false

		// 7) Мощность
		if (selPower.size) {
			const pw = norm(p?.power)
			if (!selPower.has(pw)) return false
		}

		// 8) Вид
		if (selView.size) {
			const v = norm(p?.view)
			if (!selView.has(v)) return false
		}

		// 9) Размер
		if (selSize.size) {
			const s = norm(p?.size)
			if (!selSize.has(s)) return false
		}

		// 10) Теги (все должны присутствовать)
		if (!tagsMatch(form?.tags, p)) return false

		return true
	})
}

// совместимость со старыми импортами
export const applyFilters = applyAdvancedFilter
