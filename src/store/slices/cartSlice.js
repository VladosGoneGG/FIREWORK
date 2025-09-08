import { createSlice } from '@reduxjs/toolkit'

export const initialCartState = {
	items: [],
	total: 0,
}

const calcTotal = items =>
	items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)

const cartSlice = createSlice({
	name: 'cart',
	initialState: initialCartState,
	reducers: {
		addItem(state, { payload }) {
			const idx = state.items.findIndex(i => i.id === payload.id)
			if (idx >= 0) state.items[idx].quantity += 1
			else state.items.push({ ...payload, quantity: 1 })
			state.total = calcTotal(state.items)
		},
		updateQuantity(state, { payload: { id, quantity } }) {
			const it = state.items.find(i => i.id === id)
			if (it) {
				it.quantity = Math.max(1, quantity)
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

		// ВАЖНО: полная замена состояния (для гидратации из localStorage)
		setCart(state, { payload }) {
			// Immer позволяет возвращать новое состояние
			return payload && typeof payload === 'object' ? payload : state
		},
	},
})

export const { addItem, updateQuantity, removeItem, clearCart, setCart } =
	cartSlice.actions

export default cartSlice.reducer
