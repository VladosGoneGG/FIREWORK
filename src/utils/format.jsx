// src/utils/format.jsx
import { Fragment } from 'react'

export const fmtNum = n =>
	typeof n === 'number' ? new Intl.NumberFormat('ru-RU').format(n) : '—'

export const fmtPrice = n => (typeof n === 'number' ? fmtNum(n) : '—')

export const fmtPriceRub = n => (typeof n === 'number' ? `${fmtNum(n)} ` : '—')

// Полный формат (строка) — для title и т.п.
export const fmtSecFull = s => {
	if (typeof s !== 'number') return '—'
	const sec = Math.max(0, Math.floor(s))
	if (sec >= 60) return `${Math.floor(sec / 60)}м ${sec % 60}с.`
	return `${sec}с.`
}

// Компактный: возвращает JSX, где "м" и "с." — 8px
export const fmtSecCompact = s => {
	if (typeof s !== 'number') return '—'
	const sec = Math.max(0, Math.floor(s))
	const m = Math.floor(sec / 60)
	const ss = sec % 60
	const unitStyle = { fontSize: 8, lineHeight: '8px' }

	return (
		<Fragment>
			{m > 0 && (
				<Fragment>
					<span>{m}</span>
					<span style={unitStyle}>м</span>{' '}
				</Fragment>
			)}
			<span>{ss}</span>
			<span style={unitStyle}>с.</span>
		</Fragment>
	)
}

// Если где-то нужна именно строка "1м 11с."
export const fmtSecCompactText = s => fmtSecFull(s)

// Старый алиас (если кто-то использует): тоже JSX
export const renderSec = fmtSecCompact
