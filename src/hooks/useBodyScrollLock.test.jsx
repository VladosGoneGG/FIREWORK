import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useBodyScrollLock from './useBodyScrollLock'

function Locker({ active }) {
	useBodyScrollLock(active)
	return null
}

describe('useBodyScrollLock', () => {
	it('restores the original overflow after a single lock releases', () => {
		document.body.style.overflow = ''
		const { rerender, unmount } = render(<Locker active={false} />)

		rerender(<Locker active={true} />)
		expect(document.body.style.overflow).toBe('hidden')

		unmount()
		expect(document.body.style.overflow).toBe('')
	})

	it('keeps the body locked while a sibling overlay is still open (nested overlay bug)', () => {
		document.body.style.overflow = ''

		// Overlay A opens (e.g. burger menu)
		const a = render(<Locker active={true} />)
		expect(document.body.style.overflow).toBe('hidden')

		// Overlay B opens while A is still open (e.g. cart accordion)
		const b = render(<Locker active={true} />)
		expect(document.body.style.overflow).toBe('hidden')

		// A closes — B is still open, scroll must stay locked
		a.unmount()
		expect(document.body.style.overflow).toBe('hidden')

		// B closes — now it's safe to unlock
		b.unmount()
		expect(document.body.style.overflow).toBe('')
	})
})
