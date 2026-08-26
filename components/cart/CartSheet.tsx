'use client'

import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useRef } from 'react'
import { useModalA11y } from '@/components/ui/useModalA11y'
import { useCart } from './CartProvider'
import CartBody from './CartBody'

const TITLE_ID = 'cart-sheet-title'

// Mobile (<1024px): a bottom sheet with real spring physics, not the
// desktop aside's plain in-flow column — ported from the original's
// MobileCartAccordionItems.jsx spring config. True modal (focus trap,
// Escape, backdrop) via the shared useModalA11y hook.
export default function CartSheet() {
	const { isOpen, closeCart } = useCart()
	const panelRef = useRef<HTMLDivElement>(null)
	useModalA11y(isOpen, closeCart, panelRef)

	return (
		<>
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<>
								<motion.div
									key="backdrop"
									className="fixed inset-0 z-50 bg-black/40"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									onClick={closeCart}
									aria-hidden
								/>
								<motion.div
									key="sheet"
									ref={panelRef}
									role="dialog"
									aria-modal="true"
									aria-labelledby={TITLE_ID}
									className="font-baron fixed right-0 bottom-0 left-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
									initial={{ y: '100%' }}
									animate={{ y: 0 }}
									exit={{ y: '100%' }}
									transition={{ type: 'spring', stiffness: 260, damping: 28 }}
								>
									<div className="flex items-center justify-between border-b border-[#efebe6] px-4 py-3">
										<h2 id={TITLE_ID} className="text-base font-semibold text-[#333]">
											корзина
										</h2>
										<button
											type="button"
											onClick={closeCart}
											aria-label="Закрыть корзину"
											className="flex h-11 w-11 items-center justify-center rounded-full text-[#9c9c9c] hover:bg-[#f6f4f2] hover:text-[#333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-firework-red"
										>
											✕
										</button>
									</div>
									<CartBody onRequestClose={closeCart} />
								</motion.div>
							</>
						)}
					</AnimatePresence>,
					document.body
				)}
		</>
	)
}
