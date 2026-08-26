'use client'

import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useModalA11y } from './useModalA11y'

/**
 * Shared overlay-dialog primitive: correct dialog semantics, Escape to
 * close, focus moved into the panel on open and restored to whatever
 * triggered it on close, backdrop click closes. Built once here so every
 * overlay in the app gets this for free instead of each re-implementing it
 * slightly differently — which is exactly how the old app ended up with
 * zero of its overlays having any of this (audit finding: no role="dialog"
 * or aria-modal anywhere). The a11y wiring itself lives in useModalA11y,
 * shared with the mobile nav drawer and cart sheet.
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
	useModalA11y(open, onClose, panelRef)

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
						? 'scroll-hidden motion-safe:animate-slide-in-right absolute right-0 top-0 h-full w-full max-w-[380px] overflow-y-auto bg-white shadow-xl'
						: 'scroll-hidden motion-safe:animate-fade-in absolute left-1/2 top-1/2 max-h-[85vh] w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-xl'
				}
			>
				{children}
			</div>
		</div>,
		document.body
	)
}
