// Canonical formatting helpers — the old app had fmtPrice/fmtPriceRub in
// utils/format.jsx plus ad-hoc `new Intl.NumberFormat('ru-RU').format(n)`
// calls repeated across ProductCard, ProductCardMini, ProductDetails,
// PriceQtyButton and ProductCart. One implementation here.

export function formatPrice(n: number): string {
	return new Intl.NumberFormat('ru-RU').format(n)
}

export function formatDuration(seconds: number): string {
	const sec = Math.max(0, Math.floor(seconds))
	if (sec >= 60) return `${Math.floor(sec / 60)}м ${sec % 60}с`
	return `${sec}с`
}
