// src/components/PressableButton/PressableButton.jsx
import { useCallback, useState } from 'react'

const PressableButton = ({
	className = '',
	children,
	type = 'button',
	// КАСТОМНЫЕ пропы — вынимаем, чтобы НЕ улетели в DOM
	pressScale = 0.98, // число, например 0.98
	pressTint, // цвет/градиент, например 'rgba(0,0,0,.08)' или '#00000014'
	// любые остальные — безопасно пробрасываем
	...rest
}) => {
	const [pressed, setPressed] = useState(false)

	const onDown = useCallback(() => setPressed(true), [])
	const onUp = useCallback(() => setPressed(false), [])

	return (
		<button
			type={type}
			// базовые стили, как у тебя
			className={[
				'relative select-none cursor-pointer rounded-[12px]',
				'transition-[color,transform] duration-150 ease-out',
				'transform-gpu',
				'focus:outline-none',
				className,
			].join(' ')}
			// управляем «нажатием» мышью и клавиатурой
			onMouseDown={e => {
				onDown()
				rest.onMouseDown?.(e)
			}}
			onMouseUp={e => {
				onUp()
				rest.onMouseUp?.(e)
			}}
			onMouseLeave={e => {
				onUp()
				rest.onMouseLeave?.(e)
			}}
			onTouchStart={e => {
				onDown()
				rest.onTouchStart?.(e)
			}}
			onTouchEnd={e => {
				onUp()
				rest.onTouchEnd?.(e)
			}}
			onKeyDown={e => {
				if (e.key === ' ' || e.key === 'Enter') onDown()
				rest.onKeyDown?.(e)
			}}
			onKeyUp={e => {
				if (e.key === ' ' || e.key === 'Enter') onUp()
				rest.onKeyUp?.(e)
			}}
			// кастомный scale при нажатии (если не хочешь кастом — просто не передавай pressScale)
			style={pressed ? { transform: `scale(${pressScale})` } : undefined}
			{...rest} // ВНИМАНИЕ: здесь уже НЕТ pressScale/pressTint
		>
			{children}

			{/* Тинт-оверлей при нажатии (если задан pressTint) */}
			{pressTint && (
				<span
					aria-hidden='true'
					className='pointer-events-none absolute inset-0 rounded-[inherit]'
					style={{
						background: pressTint,
						opacity: pressed ? 1 : 0,
						transition: 'opacity 150ms ease-out',
					}}
				/>
			)}
		</button>
	)
}

export default PressableButton
