import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useEffect } from 'react'
import CheckoutForm from './CheckoutForm'

/**
 * Props:
 * - open: boolean
 * - formRef: ref (forward на CheckoutForm)
 * - onSubmitted: (data) => void
 */
const InplaceCheckoutSheet = forwardRef(function InplaceCheckoutSheet(
	{ open, formRef, onSubmitted },
	_ // не используем второй ref
) {
	// автофокус на поле телефона при открытии
	useEffect(() => {
		if (!open) return
		const id = requestAnimationFrame(() => formRef?.current?.focusFirst?.())
		return () => cancelAnimationFrame(id)
	}, [open, formRef])

	return (
		<AnimatePresence initial={false}>
			{open && (
				<motion.div
					key='inplace-sheet'
					initial={{ height: 0, opacity: 0 }}
					animate={{ height: 'auto', opacity: 1 }}
					exit={{ height: 0, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 260, damping: 28 }}
					className='px-2'
				>
					{/* ВНИМАНИЕ: внутри — твоя форма без изменений стилей */}
					<CheckoutForm ref={formRef} onSubmitted={onSubmitted} />
				</motion.div>
			)}
		</AnimatePresence>
	)
})

export default InplaceCheckoutSheet
