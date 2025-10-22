// src/store/slices/detailsSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	selectedProductId: null,
	selectedProductSnapshot: null, // копия на момент открытия
}

const detailsSlice = createSlice({
	name: 'details',
	initialState,
	reducers: {
		// payload может быть объект product ИЛИ id
		openDetails(state, action) {
			const p = action.payload
			if (p && typeof p === 'object') {
				state.selectedProductId = p.id ?? null
				state.selectedProductSnapshot = p
			} else {
				state.selectedProductId = p ?? null
				state.selectedProductSnapshot = null
			}
		},
		closeDetails(state) {
			state.selectedProductId = null
			state.selectedProductSnapshot = null
		},
	},
})

export const { openDetails, closeDetails } = detailsSlice.actions

export const selectSelectedProductId = s => s.details.selectedProductId

// Возвращаем то, что есть в items, иначе снапшот
export const selectSelectedProduct = s => {
	const id = s.details.selectedProductId
	const list = s.products.items || []
	if (id != null) {
		const found = list.find(p => p.id === id)
		if (found) return found
	}
	return s.details.selectedProductSnapshot || null
}

export default detailsSlice.reducer
