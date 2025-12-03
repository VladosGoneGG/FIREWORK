import { createSlice } from '@reduxjs/toolkit'

export const initialCartState = {
	items: [],
	total: 0,
}

// =============================
// Утилиты для работы с ценами
// =============================
const normalizeNumber = value => {
	if (typeof value === 'number') return value
	const digitsOnly = String(value ?? '').replace(/[^\d]/g, '')
	return digitsOnly ? Number(digitsOnly) : 0
}

const getUnitPrice = item => {
	const unitPrice = normalizeNumber(item?.unitPrice)
	if (unitPrice > 0) return unitPrice

	const discountPrice = normalizeNumber(item?.discountPrice)
	if (discountPrice > 0) return discountPrice

	return normalizeNumber(item?.price)
}

const calculateTotal = items =>
	items.reduce((sum, item) => {
		const quantity = Number(item?.quantity) || 1
		return sum + getUnitPrice(item) * quantity
	}, 0)

const cartSlice = createSlice({
	name: 'cart',
	initialState: initialCartState,
	reducers: {
		addItem(state, { payload }) {
			const existingItemIndex = state.items.findIndex(
				item => item.id === payload.id
			)

			if (existingItemIndex >= 0) {
				const currentQuantity = Number(state.items[existingItemIndex].quantity) || 1
				state.items[existingItemIndex].quantity = currentQuantity + 1
			} else {
				state.items.push({
					...payload,
					unitPrice: getUnitPrice(payload),
					quantity: 1,
				})
			}

			state.total = calculateTotal(state.items)
		},
		updateQuantity(state, { payload: { id, quantity } }) {
			const item = state.items.find(item => item.id === id)
			if (item) {
				item.quantity = Math.max(1, Number(quantity) || 1)
				state.total = calculateTotal(state.items)
			}
		},
		removeItem(state, { payload: id }) {
			state.items = state.items.filter(item => item.id !== id)
			state.total = calculateTotal(state.items)
		},
		clearCart(state) {
			state.items = []
			state.total = 0
		},
		setCart(state, { payload }) {
			return payload && typeof payload === 'object' ? payload : state
		},
	},
})

export const { addItem, updateQuantity, removeItem, clearCart, setCart } =
	cartSlice.actions

export default cartSlice.reducer
