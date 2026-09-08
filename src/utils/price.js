// =============================
// Утилиты для работы с ценами
// =============================

/**
 * Нормализует значение в число
 * @param {any} value - значение для нормализации
 * @returns {number} нормализованное число
 */
function normalizeNumber(value) {
	if (typeof value === 'number') return value
	return Number(value) || 0
}

/**
 * Единая логика отображения цены для карточек и страницы товара.
 * - Скидка валидна, только если обе цены заданы и discountPrice < price.
 * - Если задана только discountPrice (нет price) — она же становится
 *   основной ценой (без старой цены/зачёркивания).
 * @param {Object} item - объект товара (price, discountPrice)
 * @returns {{hasDiscount: boolean, original: number|null, current: number}}
 */
export function getPriceDisplay(item) {
	const price = normalizeNumber(item?.price)
	const discountPrice = normalizeNumber(item?.discountPrice)
	const hasDiscount = price > 0 && discountPrice > 0 && discountPrice < price

	return {
		hasDiscount,
		original: hasDiscount ? price : null,
		current: hasDiscount ? discountPrice : price > 0 ? price : discountPrice,
	}
}

/**
 * Получает актуальную цену товара (unitPrice > текущая цена по getPriceDisplay)
 * @param {Object} item - объект товара
 * @returns {number} актуальная цена
 */
export function getUnitPrice(item) {
	const unitPrice = normalizeNumber(item?.unitPrice)
	if (unitPrice > 0) return unitPrice

	return getPriceDisplay(item).current
}

