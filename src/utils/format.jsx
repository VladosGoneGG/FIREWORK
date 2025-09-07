// src/utils/format.js
export const fmtNum = n =>
	typeof n === 'number' ? new Intl.NumberFormat('ru-RU').format(n) : '—'

export const fmtPrice = n => (typeof n === 'number' ? fmtNum(n) : '—')

export const fmtPriceRub = n => (typeof n === 'number' ? `${fmtNum(n)} ₽` : '—')

export const fmtSecFull = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}м ${s % 60}с`
			: `${s}с`
		: '—'

export const fmtSecCompact = s =>
	typeof s === 'number'
		? s >= 60
			? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
			: `${s}с`
		: '—'

// если где-то нужен «рендер» времени кусками — оставим как строку:
export const renderSec = fmtSecCompact
