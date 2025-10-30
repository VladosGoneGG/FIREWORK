import { configureStore } from '@reduxjs/toolkit'
import throttle from 'lodash.throttle'
import { loadCart, saveCart } from '../utils/persistCart'
import cartReducer, { setCart } from './slices/cartSlice'
import categoriesReducer from './slices/categoriesSlice'
import detailsReducer from './slices/detailsSlice'
import filtersReducer from './slices/filtersSlice'
import productsReducer from './slices/productsSlice'

export const store = configureStore({
	reducer: {
		cart: cartReducer,
		products: productsReducer,
		categories: categoriesReducer,
		details: detailsReducer,
		filters: filtersReducer,
	},
})

const persistedCart = loadCart()
if (persistedCart) {
	store.dispatch(setCart(persistedCart))
}

store.subscribe(
	throttle(() => {
		const state = store.getState()
		saveCart(state.cart)
	}, 500)
)
