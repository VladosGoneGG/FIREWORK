import { createSlice } from '@reduxjs/toolkit'

export const initialCartState = {
	items: [],
	total: 0,
}

//  Цена за единицу
const getUnit = (it = {}) => {
	const n = v => (typeof v === 'number' ? v : Number(v))
	if (!Number.isNaN(n(it.unitPrice))) return n(it.unitPrice)
	if (!Number.isNaN(n(it.discountPrice))) return n(it.discountPrice)
	return n(it.price) || 0
}

// ⬇️ тут главное исправление: qty = Number(...) || 1
const calcTotal = items =>
	items.reduce((sum, it) => {
		const qty = Number(it?.quantity) || 1
		return sum + getUnit(it) * qty
	}, 0)

const cartSlice = createSlice({
	name: 'cart',
	initialState: initialCartState,
	reducers: {
		addItem(state, { payload }) {
			const idx = state.items.findIndex(i => i.id === payload.id)
			if (idx >= 0) {
				state.items[idx].quantity = (Number(state.items[idx].quantity) || 1) + 1
			} else {
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
		setCart(state, { payload }) {
			return payload && typeof payload === 'object' ? payload : state
		},
	},
})

export const { addItem, updateQuantity, removeItem, clearCart, setCart } =
	cartSlice.actions

export default cartSlice.reducer
