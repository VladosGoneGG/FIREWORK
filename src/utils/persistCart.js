// простая персистенция корзины в localStorage
const CART_KEY = 'cart:v1'

export function loadCart() {
	try {
		const raw = localStorage.getItem(CART_KEY)
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}

export function saveCart(cartState) {
	try {
		localStorage.setItem(CART_KEY, JSON.stringify(cartState))
	} catch {
		// ничего — например, в режиме приватности может бросить
	}
}

export function clearCartPersist() {
	try {
		localStorage.removeItem(CART_KEY)
	} catch {}
}
