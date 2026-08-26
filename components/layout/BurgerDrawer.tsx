'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useId, useRef, useState } from 'react'
import type { Category } from '@/lib/catalogue'
import { useModalA11y } from '@/components/ui/useModalA11y'

const drawerVariants = {
	closed: { x: '-100%', transition: { type: 'tween', duration: 0.22, ease: 'easeOut' } },
	open: { x: 0, transition: { type: 'tween', duration: 0.22, ease: 'easeOut' } },
} as const

function BurgerIcon() {
	return (
		<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
			<rect width="40" height="40" rx="20" fill="white" />
			<path
				d="M27 25H13C11.897 25 11 25.897 11 27C11 28.103 11.897 29 13 29H27C28.103 29 29 28.103 29 27C29 25.897 28.103 25 27 25ZM27 18H13C11.897 18 11 18.897 11 20C11 21.103 11.897 22 13 22H27C28.103 22 29 21.103 29 20C29 18.897 28.103 18 27 18ZM27 11H13C11.897 11 11 11.897 11 13C11 14.103 11.897 15 13 15H27C28.103 15 29 14.103 29 13C29 11.897 28.103 11 27 11Z"
				fill="#BD52E9"
			/>
		</svg>
	)
}

function BurgerCloseIcon() {
	return (
		<svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
			<rect x="3" y="2" width="40" height="40" rx="20" fill="white" />
			<path
				d="M27.9944 14.6194C28.1494 14.4556 28.3357 14.3244 28.5422 14.2338C28.7488 14.1432 28.9714 14.0948 29.1969 14.0917C29.4225 14.0886 29.6463 14.1307 29.8553 14.2155C30.0643 14.3004 30.2541 14.4263 30.4136 14.5858C30.5731 14.7453 30.699 14.9351 30.7839 15.1441C30.8688 15.3531 30.9109 15.577 30.9077 15.8025C30.9046 16.028 30.8563 16.2507 30.7656 16.4572C30.675 16.6637 30.5439 16.85 30.38 17.005L25.4356 21.9494C25.4291 21.9559 25.4239 21.9637 25.4203 21.9722C25.4168 21.9808 25.415 21.9899 25.415 21.9992C25.415 22.0084 25.4168 22.0176 25.4203 22.0261C25.4239 22.0346 25.4291 22.0424 25.4356 22.0489L30.38 26.9933C30.5388 27.1495 30.6651 27.3356 30.7516 27.5409C30.8382 27.7462 30.8832 27.9665 30.8841 28.1893C30.8851 28.4121 30.8419 28.6328 30.7571 28.8388C30.6723 29.0448 30.5475 29.2319 30.39 29.3895C30.2325 29.547 30.0454 29.6718 29.8394 29.7567C29.6335 29.8415 29.4127 29.8847 29.19 29.8839C28.9672 29.883 28.7468 29.838 28.5415 29.7515C28.3362 29.665 28.1501 29.5388 27.9939 29.38L23.0495 24.4356C23.043 24.4291 23.0352 24.4239 23.0267 24.4203C23.0181 24.4168 23.009 24.415 22.9997 24.415C22.9905 24.415 22.9813 24.4168 22.9728 24.4203C22.9642 24.4239 22.9565 24.4291 22.9499 24.4356L18.0055 29.38C17.8493 29.5388 17.6632 29.6651 17.458 29.7517C17.2527 29.8382 17.0323 29.8832 16.8096 29.8841C16.5868 29.8851 16.3661 29.8419 16.1601 29.7571C15.9541 29.6723 15.7669 29.5475 15.6094 29.39C15.4519 29.2325 15.3271 29.0454 15.2422 28.8394C15.1574 28.6335 15.1141 28.4127 15.115 28.19C15.1159 27.9672 15.1609 27.7468 15.2473 27.5416C15.3338 27.3363 15.4601 27.1501 15.6189 26.9939L20.5632 22.0495C20.5698 22.043 20.575 22.0352 20.5785 22.0267C20.5821 22.0181 20.5839 22.009 20.5839 21.9997C20.5839 21.9905 20.5821 21.9813 20.5785 21.9728C20.575 21.9642 20.5698 21.9565 20.5632 21.9499L15.6189 17.0056C15.3066 16.6883 15.1324 16.2604 15.1342 15.8153C15.1359 15.3701 15.3135 14.9437 15.6283 14.6288C15.943 14.314 16.3694 14.1363 16.8146 14.1344C17.2597 14.1326 17.6876 14.3067 18.005 14.6189L22.9494 19.5633C22.9559 19.5698 22.9637 19.575 22.9722 19.5785C22.9807 19.5821 22.9899 19.5839 22.9991 19.5839C23.0084 19.5839 23.0175 19.5821 23.0261 19.5785C23.0346 19.575 23.0424 19.5698 23.0489 19.5633L27.9944 14.6194Z"
				fill="#BD52E9"
			/>
		</svg>
	)
}

export default function BurgerDrawer({ categories }: { categories: Category[] }) {
	const [open, setOpen] = useState(false)
	const [expandedId, setExpandedId] = useState<number | null>(null)
	const panelRef = useRef<HTMLDivElement>(null)
	const titleId = useId()

	const handleClose = () => setOpen(false)
	useModalA11y(open, handleClose, panelRef)

	return (
		<>
			<button
				type="button"
				aria-label="Открыть меню"
				onClick={() => setOpen(true)}
				className="inline-flex items-center justify-center"
			>
				<BurgerIcon />
			</button>

			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{open && (
							<>
								<motion.div
									key="backdrop"
									className="fixed inset-0 z-[1200] bg-black/30"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									onClick={handleClose}
									aria-hidden
								/>
								<motion.aside
									key="drawer"
									ref={panelRef}
									role="dialog"
									aria-modal="true"
									aria-labelledby={titleId}
									className="scroll-hidden fixed top-0 left-0 z-[1201] h-full w-96 max-w-[90vw] overflow-y-auto bg-[#EFEBE6] px-2 pt-1 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]"
									variants={drawerVariants}
									initial="closed"
									animate="open"
									exit="closed"
								>
									<h2 id={titleId} className="sr-only">
										Меню
									</h2>
									<button type="button" aria-label="Закрыть меню" onClick={handleClose}>
										<BurgerCloseIcon />
									</button>

									<div className="mt-1 max-w-[335px] space-y-2.5 px-2.5">
										<div className="self-stretch space-y-[2px] rounded-[20px] bg-white p-3.5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]">
											<ul className="space-y-1">
												<li className="font-baron">
													<Link
														href="/"
														onClick={handleClose}
														className="flex min-h-11 items-center rounded-[12px] px-2 text-[#333] lowercase hover:text-firework-red"
													>
														все
													</Link>
												</li>
												{categories
													.filter(c => c.slug !== 'all')
													.map(cat => {
														const hasSubs = cat.subcategories.length > 0
														const isOpen = expandedId === cat.id && hasSubs
														return (
															<li className="font-baron" key={cat.id}>
																{hasSubs ? (
																	<button
																		type="button"
																		onClick={() =>
																			setExpandedId(prev => (prev === cat.id ? null : cat.id))
																		}
																		className="flex min-h-11 w-full items-center rounded-[12px] px-2 text-left text-[#333] lowercase hover:text-firework-red"
																		aria-expanded={isOpen}
																	>
																		{cat.name}
																	</button>
																) : (
																	<Link
																		href={`/category/${cat.slug}`}
																		onClick={handleClose}
																		className="flex min-h-11 items-center rounded-[12px] px-2 text-[#333] lowercase hover:text-firework-red"
																	>
																		{cat.name}
																	</Link>
																)}
																<AnimatePresence initial={false}>
																	{isOpen && (
																		<motion.ul
																			key={`${cat.id}-subs`}
																			initial={{ height: 0, opacity: 0 }}
																			animate={{ height: 'auto', opacity: 1 }}
																			exit={{ height: 0, opacity: 0 }}
																			transition={{ duration: 0.18, ease: 'easeOut' }}
																			className="mt-1 space-y-1 overflow-hidden pl-9"
																		>
																			{cat.subcategories.map(sub => (
																				<li key={sub.id}>
																					<Link
																						href={`/category/${cat.slug}?sub=${encodeURIComponent(sub.name)}`}
																						onClick={handleClose}
																						className="flex min-h-9 items-center text-sm text-[#625a51] lowercase hover:text-firework-red"
																					>
																						{sub.name}
																					</Link>
																				</li>
																			))}
																		</motion.ul>
																	)}
																</AnimatePresence>
															</li>
														)
													})}
											</ul>
										</div>

										<div className="space-y-5 self-stretch p-2.5">
											<div className="flex flex-col gap-2.5">
												<Link
													href="/contacts"
													onClick={handleClose}
													className="font-baron cursor-pointer text-sm text-[#625a51] lowercase"
												>
													контакты
												</Link>
												<Link
													href="/wholesale"
													onClick={handleClose}
													className="font-baron cursor-pointer text-sm text-[#625a51] lowercase"
												>
													оптовикам
												</Link>
											</div>
											<div className="flex flex-col gap-2.5">
												<div className="font-baron text-sm text-[#625a51] lowercase">
													ИП Федяков Иван Владимирович
												</div>
												<div className="font-baron text-sm text-[#625a51] lowercase">
													сертификат профессионального пиротехника
												</div>
											</div>
										</div>
									</div>
								</motion.aside>
							</>
						)}
					</AnimatePresence>,
					document.body
				)}
		</>
	)
}
