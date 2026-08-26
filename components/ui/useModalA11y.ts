'use client'

import { useEffect, useRef } from 'react'

/**
 * Shared modal accessibility behavior: focus moved into the panel on open,
 * focus trapped inside it while open, Escape closes, focus restored to
 * whatever triggered it on close, background scroll locked. Extracted from
 * components/ui/Dialog.tsx so every true-modal overlay (cart sheet, mobile
 * nav drawer) gets this for free instead of re-implementing it slightly
 * differently.
 */
export function useModalA11y(
	open: boolean,
	onClose: () => void,
	panelRef: React.RefObject<HTMLElement | null>
) {
	const triggerRef = useRef<Element | null>(null)

	useEffect(() => {
		if (!open) return

		triggerRef.current = document.activeElement
		const panel = panelRef.current
		const focusable = panel?.querySelector<HTMLElement>(
			'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)
		focusable?.focus()

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
				return
			}
			if (e.key !== 'Tab' || !panel) return
			const focusables = panel.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			if (focusables.length === 0) return
			const first = focusables[0]
			const last = focusables[focusables.length - 1]
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first.focus()
			}
		}

		document.addEventListener('keydown', onKeyDown)
		const originalOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.removeEventListener('keydown', onKeyDown)
			document.body.style.overflow = originalOverflow
			if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus()
		}
	}, [open, onClose, panelRef])
}
