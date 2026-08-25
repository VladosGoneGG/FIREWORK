// Ported from the P1 fix in the old app (src/utils/validateBirthDate.js) —
// same rule, same rollover-detection fix. Kept here rather than imported
// across the src/ boundary so lib/ has no dependency on the Vite app,
// which is deleted entirely in P9.

export const BIRTH_DATE_REGEX =
	/^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/
export const MIN_AGE = 16

/** @returns true if valid, otherwise a user-facing error string. */
export function validateBirth(value: string): true | string {
	if (!BIRTH_DATE_REGEX.test(value)) {
		return 'формат: ДД.ММ.ГГГГ'
	}

	const [day, month, year] = value.split('.').map(Number)
	const birthDate = new Date(year, month - 1, day)

	// new Date(...) silently rolls impossible dates forward (31.02.2000 ->
	// 2 March 2000), so Number.isNaN alone doesn't catch them — verify the
	// parsed components didn't drift from what was typed.
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
