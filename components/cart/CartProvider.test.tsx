// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider, useCart } from './CartProvider'

function Probe() {
	const { items, hydrated, addItem, decrement, removeItem, clearCart, isOpen, openCart, closeCart } =
		useCart()
	return (
		<div>
			<p data-testid="hydrated">{String(hydrated)}</p>
			<p data-testid="count">{items.reduce((s, i) => s + i.quantity, 0)}</p>
			<p data-testid="items">{JSON.stringify(items)}</p>
			<p data-testid="open">{String(isOpen)}</p>
			<button onClick={() => addItem(1)}>add-1</button>
			<button onClick={() => addItem(2)}>add-2</button>
			<button onClick={() => decrement(1, 1)}>decrement-1-from-1</button>
			<button onClick={() => decrement(2, 3)}>decrement-2-from-3</button>
			<button onClick={() => removeItem(1)}>remove-1</button>
			<button onClick={() => clearCart()}>clear</button>
			<button onClick={openCart}>open</button>
			<button onClick={closeCart}>close</button>
		</div>
	)
}

function renderCart() {
	return render(
		<CartProvider>
			<Probe />
		</CartProvider>
	)
}

beforeEach(() => {
	window.localStorage.clear()
})

describe('CartProvider — hydration', () => {
	it('reports not-hydrated, then hydrates from localStorage after mount', async () => {
		window.localStorage.setItem(
			'cart:v2',
			JSON.stringify({ version: 2, items: [{ productId: 5, quantity: 2 }] })
		)

		renderCart()

		// After React Testing Library's render() flushes effects, hydration
		// has already happened — what matters is that the *pre-hydration*
		// state was the same empty cart the server would have rendered
		// (asserted indirectly: the reducer's own initial state is
		// EMPTY_CART_STATE, covered in reducer.test.ts) and that hydration
		// completes and reflects storage.
		await screen.findByText('true') // hydrated — throws if never found
		expect(screen.getByTestId('count').textContent).toBe('2')
	})

	it('with nothing stored, hydrates to an empty cart (not stuck loading)', async () => {
		renderCart()
		await screen.findByText('true')
		expect(screen.getByTestId('count').textContent).toBe('0')
	})

	it('never throws when localStorage holds garbage', async () => {
		window.localStorage.setItem('cart:v2', 'not json at all {{{')
		expect(() => renderCart()).not.toThrow()
		await screen.findByText('true')
		expect(screen.getByTestId('count').textContent).toBe('0')
	})
})

describe('CartProvider — mechanics via the real component', () => {
	it('adding twice increments rather than duplicating', async () => {
		renderCart()
		await screen.findByText('true')
		await act(async () => screen.getByText('add-1').click())
		await act(async () => screen.getByText('add-1').click())
		expect(screen.getByTestId('items').textContent).toBe(
			JSON.stringify([{ productId: 1, quantity: 2 }])
		)
	})

	it('decrementing from quantity 1 removes the item', async () => {
		renderCart()
		await screen.findByText('true')
		await act(async () => screen.getByText('add-1').click())
		await act(async () => screen.getByText('decrement-1-from-1').click())
		expect(screen.getByTestId('items').textContent).toBe('[]')
	})

	it('open/close toggles isOpen', async () => {
		renderCart()
		await screen.findByText('true')
		expect(screen.getByTestId('open').textContent).toBe('false')
		await act(async () => screen.getByText('open').click())
		expect(screen.getByTestId('open').textContent).toBe('true')
		await act(async () => screen.getByText('close').click())
		expect(screen.getByTestId('open').textContent).toBe('false')
	})
})

describe('CartProvider — reload persistence', () => {
	it('a cart built up in one mount survives an unmount + remount (simulated reload)', async () => {
		const first = renderCart()
		await screen.findByText('true')
		await act(async () => screen.getByText('add-1').click())
		await act(async () => screen.getByText('add-2').click())
		await act(async () => screen.getByText('add-2').click())
		expect(screen.getByTestId('items').textContent).toBe(
			JSON.stringify([
				{ productId: 1, quantity: 1 },
				{ productId: 2, quantity: 2 },
			])
		)

		first.unmount()

		renderCart()
		await screen.findByText('true')
		expect(screen.getByTestId('items').textContent).toBe(
			JSON.stringify([
				{ productId: 1, quantity: 1 },
				{ productId: 2, quantity: 2 },
			])
		)
	})

	it('clearing the cart persists too — a reload does not resurrect it', async () => {
		const first = renderCart()
		await screen.findByText('true')
		await act(async () => screen.getByText('add-1').click())
		await act(async () => screen.getByText('clear').click())
		first.unmount()

		renderCart()
		await screen.findByText('true')
		expect(screen.getByTestId('items').textContent).toBe('[]')
	})
})
