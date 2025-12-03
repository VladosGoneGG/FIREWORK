// =============================
// Утилиты нормализации строк
// =============================

/**
 * Нормализует строку: приводит к нижнему регистру, убирает пробелы, заменяет ё на е
 * @param {string} str - строка для нормализации
 * @returns {string} нормализованная строка
 */
export function normalizeString(str) {
	return String(str || '')
		.trim()
		.toLowerCase()
		.replaceAll('ё', 'е')
}

/**
 * Нормализует название категории: "Все" -> "all", остальное через normalizeString
 * @param {string} name - название категории
 * @returns {string} нормализованное название
 */
export function normalizeCategoryName(name) {
	if (name === 'Все') return 'all'
	return normalizeString(name)
}

