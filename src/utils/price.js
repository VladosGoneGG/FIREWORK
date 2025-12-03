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
 * Получает актуальную цену товара (unitPrice > discountPrice > price)
 * @param {Object} item - объект товара
 * @returns {number} актуальная цена
 */
export function getUnitPrice(item) {
	const unitPrice = normalizeNumber(item?.unitPrice)
	if (unitPrice > 0) return unitPrice

	const discountPrice = normalizeNumber(item?.discountPrice)
	if (discountPrice > 0) return discountPrice

	return normalizeNumber(item?.price)
}

