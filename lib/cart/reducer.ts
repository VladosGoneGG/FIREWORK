// Pure reducer, extracted from components/cart/CartProvider.tsx so the
// core cart mechanics (add/remove/quantity rules) are unit-testable
// without React or a DOM.

import type { CartState } from './schema'

export type CartAction =
	| { type: 'hydrate'; state: CartState }
	| { type: 'add'; productId: number }
	| { type: 'setQuantity'; productId: number; quantity: number }
	| { type: 'remove'; productId: number }
	| { type: 'clear' }

export function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case 'hydrate':
			return action.state
		case 'add': {
			const existing = state.items.find(i => i.productId === action.productId)
			const items = existing
				? state.items.map(i =>
						i.productId === action.productId ? { ...i, quantity: i.quantity + 1 } : i
					)
				: [...state.items, { productId: action.productId, quantity: 1 }]
			return { ...state, items }
		}
		case 'setQuantity': {
			// Quantity floor is 1 here — dropping to/below 0 is "remove", a
			// distinct action the caller (decrement) chooses explicitly.
			const quantity = Math.max(1, Math.floor(action.quantity) || 1)
			return {
				...state,
				items: state.items.map(i =>
					i.productId === action.productId ? { ...i, quantity } : i
				),
			}
		}
		case 'remove':
			return { ...state, items: state.items.filter(i => i.productId !== action.productId) }
		case 'clear':
			return { ...state, items: [] }
	}
}
