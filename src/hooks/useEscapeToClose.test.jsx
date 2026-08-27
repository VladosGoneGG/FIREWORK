import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useEscapeToClose from './useEscapeToClose'

function Overlay({ active, onClose }) {
	useEscapeToClose(active, onClose)
	return null
}

function pressEscape() {
	fireEvent.keyDown(window, { key: 'Escape' })
}

describe('useEscapeToClose', () => {
	it('closes the only active overlay on Escape', () => {
		const onClose = vi.fn()
		render(<Overlay active={true} onClose={onClose} />)

		pressEscape()

		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('does nothing when inactive', () => {
		const onClose = vi.fn()
		render(<Overlay active={false} onClose={onClose} />)

		pressEscape()

		expect(onClose).not.toHaveBeenCalled()
	})

	it('closes only the topmost overlay when two are open (nested/sibling case)', () => {
		const closeFirst = vi.fn()
		const closeSecond = vi.fn()

		const first = render(<Overlay active={true} onClose={closeFirst} />)
		const second = render(<Overlay active={true} onClose={closeSecond} />)

		pressEscape()
		expect(closeFirst).not.toHaveBeenCalled()
		expect(closeSecond).toHaveBeenCalledTimes(1)

		// second closes (unmounts) — Escape now reaches the first
		second.unmount()
		pressEscape()
		expect(closeFirst).toHaveBeenCalledTimes(1)

		first.unmount()
	})

	it('moves to the next layer on a second Escape even if the closed overlay stays mounted mid-exit-animation', () => {
		// Mirrors a real overlay nested inside an AnimatePresence-gated wrapper:
		// its `active` prop stays frozen at `true` until the exit animation
		// finishes, so the component never re-renders with active=false and
		// never runs its own cleanup in response to that prop changing.
		const closeFirst = vi.fn()
		const closeSecond = vi.fn()

		render(<Overlay active={true} onClose={closeFirst} />)
		render(<Overlay active={true} onClose={closeSecond} />)

		pressEscape()
		expect(closeSecond).toHaveBeenCalledTimes(1)
		expect(closeFirst).not.toHaveBeenCalled()

		// Second overlay's `active` prop never flips to false (frozen mid-exit) —
		// a rapid second Escape must still reach the first, not repeat the second.
		pressEscape()
		expect(closeSecond).toHaveBeenCalledTimes(1)
		expect(closeFirst).toHaveBeenCalledTimes(1)
	})

	it('always calls the latest onClose without re-registering on every render', () => {
		const onCloseA = vi.fn()
		const onCloseB = vi.fn()
		const { rerender } = render(<Overlay active={true} onClose={onCloseA} />)

		rerender(<Overlay active={true} onClose={onCloseB} />)
		pressEscape()

		expect(onCloseA).not.toHaveBeenCalled()
		expect(onCloseB).toHaveBeenCalledTimes(1)
	})
})
