// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit'

export const initialCartState = {
	items: [],
	total: 0,
}

// Всегда берём цену в таком порядке:
// 1) item.unitPrice (если уже сохранена в корзине)
// 2) item.discountPrice
// 3) item.price
const getUnit = (it = {}) => {
	const n = v => (typeof v === 'number' ? v : Number(v))
	if (!Number.isNaN(n(it.unitPrice))) return n(it.unitPrice)
	if (!Number.isNaN(n(it.discountPrice))) return n(it.discountPrice)
	return n(it.price) || 0
}

const calcTotal = items =>
	items.reduce((sum, it) => sum + getUnit(it) * (it.quantity || 1), 0)

const cartSlice = createSlice({
	name: 'cart',
	initialState: initialCartState,
	reducers: {
		addItem(state, { payload }) {
			const idx = state.items.findIndex(i => i.id === payload.id)
			if (idx >= 0) {
				state.items[idx].quantity += 1
			} else {
				// Фиксируем unitPrice на момент добавления — UI и total будут консистентны
				state.items.push({
					...payload,
					unitPrice: getUnit(payload),
					quantity: 1,
				})
			}
			state.total = calcTotal(state.items)
		},
		updateQuantity(state, { payload: { id, quantity } }) {
			const it = state.items.find(i => i.id === id)
			if (it) {
				it.quantity = Math.max(1, Number(quantity) || 1)
				state.total = calcTotal(state.items)
			}
		},
		removeItem(state, { payload: id }) {
			state.items = state.items.filter(i => i.id !== id)
			state.total = calcTotal(state.items)
		},
		clearCart(state) {
			state.items = []
			state.total = 0
		},
		// гидратация из localStorage
		setCart(state, { payload }) {
			return payload && typeof payload === 'object' ? payload : state
		},
	},
})

export const { addItem, updateQuantity, removeItem, clearCart, setCart } =
	cartSlice.actions

export default cartSlice.reducer
