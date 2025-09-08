// src/utils/filters.js

const norm = s =>
	String(s ?? '')
		.trim()
		.toLowerCase()
		.replaceAll('ё', 'е')
		.replace(/\s+/g, ' ')

const hasVal = v => v !== null && v !== undefined && String(v).trim() !== ''

const inRange = (val, range = {}) => {
	if (val === null || val === undefined) return false
	const { min, max } = range
	if (hasVal(min) && Number(val) < Number(min)) return false
	if (hasVal(max) && Number(val) > Number(max)) return false
	return true
}

/**
 * Применяет ТОЛЬКО заданные поля.
 * Поддержка:
 * - name, manufacturer, category, subcategory (строки)
 * - shots/caliber/durationSec/effectsCount/price (диапазоны)
 * - caliberText (строка-подстрока для калибра, альтернатива диапазону)
 * - hasCertificate (true -> certificateUrl truthy)
 * - inStockOnly (true -> stock > 0)
 */
export function applyAdvancedFilter(products = [], filters = {}) {
	if (!Array.isArray(products) || products.length === 0) return []
	if (
		!filters ||
		typeof filters !== 'object' ||
		Object.keys(filters).length === 0
	) {
		return products
	}

	const nameQ = hasVal(filters.name) ? norm(filters.name) : ''
	const manufQ = hasVal(filters.manufacturer) ? norm(filters.manufacturer) : ''
	const catQ = hasVal(filters.category) ? norm(filters.category) : ''
	const subcatQ = hasVal(filters.subcategory) ? norm(filters.subcategory) : ''
	const caliberTextQ = hasVal(filters.caliberText)
		? norm(filters.caliberText)
		: ''
	const stockOnly = Boolean(filters.inStockOnly)
	const certOnly = Boolean(filters.hasCertificate)

	const shotsR = filters.shots
	const caliberR = filters.caliber
	const durationR = filters.durationSec
	const effectsR = filters.effectsCount
	const priceR = filters.price

	return products.filter(p => {
		// name/manufacturer contains
		if (nameQ) {
			const hit =
				norm(p.name).includes(nameQ) ||
				norm(p.manufacturer || '').includes(nameQ)
			if (!hit) return false
		}

		if (manufQ) {
			if (!norm(p.manufacturer || '').includes(manufQ)) return false
		}

		if (catQ && norm(p.category) !== catQ) return false
		if (subcatQ && norm(p.subcategory) !== subcatQ) return false

		// numeric ranges
		if (shotsR && (hasVal(shotsR.min) || hasVal(shotsR.max))) {
			if (!inRange(p.shots, shotsR)) return false
		}

		// caliber: либо диапазон, либо подстрока (если задан caliberText)
		if (caliberR && (hasVal(caliberR.min) || hasVal(caliberR.max))) {
			const val = parseFloat(p.caliber)
			if (!inRange(val, caliberR)) return false
		}
		if (caliberTextQ) {
			if (!norm(p.caliber).includes(caliberTextQ)) return false
		}

		if (durationR && (hasVal(durationR.min) || hasVal(durationR.max))) {
			if (!inRange(p.durationSec, durationR)) return false
		}

		if (effectsR && (hasVal(effectsR.min) || hasVal(effectsR.max))) {
			if (!inRange(p.effectsCount, effectsR)) return false
		}

		if (priceR && (hasVal(priceR.min) || hasVal(priceR.max))) {
			const price = hasVal(p.discountPrice)
				? Number(p.discountPrice)
				: Number(p.price)
			if (!inRange(price, priceR)) return false
		}

		if (stockOnly) {
			if (!p.stock || Number(p.stock) <= 0) return false
		}

		if (certOnly) {
			if (!p.certificateUrl) return false
		}

		return true
	})
}
