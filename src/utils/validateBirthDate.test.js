import { describe, expect, it } from 'vitest'
import { validateBirth } from './validateBirthDate'

describe('validateBirth', () => {
	it('rejects malformed input', () => {
		expect(validateBirth('')).toBe('формат: ДД.ММ.ГГГГ')
		expect(validateBirth('2000-01-01')).toBe('формат: ДД.ММ.ГГГГ')
		expect(validateBirth('1.1.2000')).toBe('формат: ДД.ММ.ГГГГ')
	})

	// C4 — JS silently rolls impossible dates forward
	// (new Date(2000, 1, 31) becomes 2 March 2000), so a naive
	// Number.isNaN(date.getTime()) check never catches these.
	it('rejects dates that do not exist', () => {
		expect(validateBirth('31.02.2000')).toBe('некорректная дата')
		expect(validateBirth('31.04.2000')).toBe('некорректная дата')
		expect(validateBirth('29.02.2001')).toBe('некорректная дата') // not a leap year
		// day=32 is rejected by the format regex itself, not the rollover check
		expect(validateBirth('32.01.2000')).toBe('формат: ДД.ММ.ГГГГ')
		expect(validateBirth('00.01.2000')).toBe('формат: ДД.ММ.ГГГГ')
	})

	it('accepts a real leap-year date', () => {
		expect(validateBirth('29.02.2000')).toBe(true)
	})

	it('enforces the 16+ minimum age against today', () => {
		const today = new Date()
		const fmt = d =>
			`${String(d.getDate()).padStart(2, '0')}.${String(
				d.getMonth() + 1
			).padStart(2, '0')}.${d.getFullYear()}`

		const exactly16 = new Date(
			today.getFullYear() - 16,
			today.getMonth(),
			today.getDate()
		)
		const oneDayShyOf16 = new Date(
			today.getFullYear() - 16,
			today.getMonth(),
			today.getDate() + 1
		)

		expect(validateBirth(fmt(exactly16))).toBe(true)
		expect(validateBirth(fmt(oneDayShyOf16))).toBe('только 16+')
	})
})
