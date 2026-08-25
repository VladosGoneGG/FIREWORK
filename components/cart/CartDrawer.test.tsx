// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const resolveCartAction = vi.fn()
vi.mock('@/lib/cart/actions', () => ({
	resolveCartAction: (...args: unknown[]) => resolveCartAction(...args),
}))

// Imported after the mock so CartDrawer's dependency graph picks it up.
const { CartProvider, useCart } = await import('./CartProvider')
const { default: CartDrawer } = await import('./CartDrawer')

function Trigger() {
	const { addItem, openCart } = useCart()
	return (
		<button
			onClick={() => {
				addItem(1)
				openCart()
			}}
		>
			add-and-open
		</button>
	)
}

beforeEach(() => {
	window.localStorage.clear()
	resolveCartAction.mockReset()
})

describe('CartDrawer — minimum order threshold', () => {
	it('disables checkout and shows the shortfall below ₽4,800', async () => {
		resolveCartAction.mockResolvedValue({
			lines: [
				{
					productId: 1,
					slug: 'x',
					name: 'Товар',
					manufacturer: 'M',
					quantity: 1,
					unitPrice: 1000,
					originalPrice: 1000,
					discounted: false,
					lineTotal: 1000,
					stock: 5,
					inStock: true,
				},
			],
			total: 1000,
			removedProductIds: [],
		})

		render(
			<CartProvider>
				<Trigger />
				<CartDrawer />
			</CartProvider>
		)
		await act(async () => screen.getByText('add-and-open').click())

		const button = await screen.findByRole('button', { name: /не хватает ещё/ })
		expect((button as HTMLButtonElement).disabled).toBe(true)
		// Intl.NumberFormat('ru-RU') separates thousands with a non-breaking
		// space (U+00A0), not a regular one — match loosely rather than
		// hardcode that character into the test.
		expect(button.textContent?.replace(/\s/g, ' ')).toContain('3 800') // 4800 - 1000
	})

	it('enables checkout at or above ₽4,800', async () => {
		resolveCartAction.mockResolvedValue({
			lines: [
				{
					productId: 1,
					slug: 'x',
					name: 'Товар',
					manufacturer: 'M',
					quantity: 5,
					unitPrice: 1000,
					originalPrice: 1000,
					discounted: false,
					lineTotal: 5000,
					stock: 5,
					inStock: true,
				},
			],
			total: 5000,
			removedProductIds: [],
		})

		render(
			<CartProvider>
				<Trigger />
				<CartDrawer />
			</CartProvider>
		)
		await act(async () => screen.getByText('add-and-open').click())

		const button = await screen.findByRole('button', { name: 'продолжить' })
		expect((button as HTMLButtonElement).disabled).toBe(false)
	})

	it('surfaces removed/unavailable products with an explanation, not a silent total change', async () => {
		resolveCartAction.mockResolvedValue({
			lines: [],
			total: 0,
			removedProductIds: [1],
		})

		render(
			<CartProvider>
				<Trigger />
				<CartDrawer />
			</CartProvider>
		)
		await act(async () => screen.getByText('add-and-open').click())

		const alert = await screen.findByRole('alert')
		expect(alert.textContent).toMatch(/больше недоступен/)
	})
})
