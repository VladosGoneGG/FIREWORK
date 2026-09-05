// src/utils/power.js
// Простая эвристика "мощности": реальных данных о мощности в источнике нет,
// но её можно оценить по калибру/количеству эффектов.
export function powerBucket({ caliber, effectsCount } = {}) {
	const cal = Number(caliber)
	if (Number.isFinite(cal)) {
		if (cal < 1.0) return 'слабый'
		if (cal <= 1.25) return 'средний'
		return 'мощный'
	}
	const eff = Number(effectsCount)
	if (Number.isFinite(eff)) {
		if (eff < 4) return 'слабый'
		if (eff <= 8) return 'средний'
		return 'мощный'
	}
	return ''
}
