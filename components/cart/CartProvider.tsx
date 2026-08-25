'use client'

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { cartReducer } from '@/lib/cart/reducer'
import { EMPTY_CART_STATE, type CartItem } from '@/lib/cart/schema'
import { loadCart, saveCart } from '@/lib/cart/storage'

interface CartContextValue {
	items: CartItem[]
	/** True once the client has read localStorage — see the hydration note below. */
	hydrated: boolean
	addItem: (productId: number) => void
	setQuantity: (productId: number, quantity: number) => void
	/** Decrementing from 1 removes the item — the old app's rule, preserved. */
	decrement: (productId: number, currentQuantity: number) => void
	removeItem: (productId: number) => void
	clearCart: () => void
	isOpen: boolean
	openCart: () => void
	closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
	// Initial state is always the empty cart, on both server and the first
	// client render — matching what the server rendered. The real cart is
	// read from localStorage in an effect *after* mount, so hydration never
	// has anything to mismatch against. A second render then picks up the
	// real items; `hydrated` lets consumers tell "empty" from "not read yet".
	const [state, dispatch] = useReducer(cartReducer, EMPTY_CART_STATE)
	const [hydrated, setHydrated] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		// Reading localStorage — an external system only available client-side
		// — is exactly the effect use case react-hooks' own linked docs
		// endorse ("subscribe for updates from some external system, calling
		// setState... when external state changes"). Not derivable during
		// render: that's the whole reason it has to be an effect.
		dispatch({ type: 'hydrate', state: loadCart() })
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHydrated(true)
	}, [])

	useEffect(() => {
		if (!hydrated) return // don't stomp storage with the empty pre-hydration state
		saveCart(state)
	}, [state, hydrated])

	const value = useMemo<CartContextValue>(
		() => ({
			items: state.items,
			hydrated,
			addItem: productId => dispatch({ type: 'add', productId }),
			setQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
			decrement: (productId, currentQuantity) => {
				if (currentQuantity <= 1) dispatch({ type: 'remove', productId })
				else dispatch({ type: 'setQuantity', productId, quantity: currentQuantity - 1 })
			},
			removeItem: productId => dispatch({ type: 'remove', productId }),
			clearCart: () => dispatch({ type: 'clear' }),
			isOpen,
			openCart: () => setIsOpen(true),
			closeCart: () => setIsOpen(false),
		}),
		[state.items, hydrated, isOpen]
	)

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within a CartProvider')
	return ctx
}
