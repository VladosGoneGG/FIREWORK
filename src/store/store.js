import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import categoriesReducer from './slices/categoriesSlice'
import productsReducer from './slices/productsSlice'

export const store = configureStore({
	reducer: {
		cart: cartReducer,
		products: productsReducer,
		categories: categoriesReducer,
	},
})
