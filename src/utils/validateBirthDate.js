// Общая логика проверки даты рождения — используется формой на клиенте и
// (в дальнейшем) Server Action-ом при оформлении заказа (см. миграцию, P6).
// Оба места ДОЛЖНЫ применять одно и то же правило: клиентская проверка —
// это UX, а не гарантия корректности.

export const BIRTH_DATE_REGEX =
	/^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/
export const MIN_AGE = 16

/**
 * @param {string} value - строка в формате ДД.ММ.ГГГГ
 * @returns {true | string} true если валидно, иначе текст ошибки
 */
export function validateBirth(value) {
	if (!BIRTH_DATE_REGEX.test(value)) {
		return 'формат: ДД.ММ.ГГГГ'
	}

	const [day, month, year] = value.split('.').map(Number)
	const birthDate = new Date(year, month - 1, day)

	// new Date(...) переносит несуществующие даты на следующий месяц
	// (например, 31.02.2000 -> 2 марта 2000), поэтому недостаточно
	// проверить Number.isNaN — нужно свериться, что компоненты не «уехали».
	const rolledOver =
		birthDate.getFullYear() !== year ||
		birthDate.getMonth() !== month - 1 ||
		birthDate.getDate() !== day

	if (Number.isNaN(birthDate.getTime()) || rolledOver) {
		return 'некорректная дата'
	}

	const today = new Date()
	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDiff = today.getMonth() - birthDate.getMonth()

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}

	return age >= MIN_AGE || 'только 16+'
}
