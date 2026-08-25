'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Shared overlay-dialog primitive: correct dialog semantics, Escape to
 * close, focus moved into the panel on open and restored to whatever
 * triggered it on close, backdrop click closes. Built once here so every
 * overlay in the app (cart drawer now, search/filters later) gets this for
 * free instead of each re-implementing it slightly differently — which is
 * exactly how the old app ended up with zero of its overlays having any of
 * this (audit finding: no role="dialog" or aria-modal anywhere).
 */
export default function Dialog({
	open,
	onClose,
	titleId,
	children,
	side = 'right',
}: {
	open: boolean
	onClose: () => void
	titleId: string
	children: React.ReactNode
	side?: 'right' | 'center'
}) {
	const panelRef = useRef<HTMLDivElement>(null)
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
	}, [open, onClose])

	if (!open) return null

	return createPortal(
		<div className="fixed inset-0 z-50">
			<div
				className="motion-safe:animate-fade-in absolute inset-0 bg-black/40"
				onClick={onClose}
				aria-hidden
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={
					side === 'right'
						? 'motion-safe:animate-slide-in-right absolute right-0 top-0 h-full w-full max-w-[380px] overflow-y-auto bg-white shadow-xl'
						: 'motion-safe:animate-fade-in absolute left-1/2 top-1/2 max-h-[85vh] w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-xl'
				}
			>
				{children}
			</div>
		</div>,
		document.body
	)
}
