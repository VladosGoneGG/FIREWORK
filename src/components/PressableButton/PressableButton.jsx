// src/components/PressableButton/PressableButton.jsx
const PressableButton = ({
	className = '',
	children,
	type = 'button',
	...props
}) => {
	return (
		<button
			type={type}
			className={[
				// базовые стили кнопки-строки для категорий
				'relative select-none cursor-pointer rounded-[12px]',
				// плавная анимация только цвета текста и push-эффект
				'transition-[color,transform] duration-150 ease-out',
				'transform-gpu active:[transform:scale(0.98)]',
				'focus:outline-none',
				className,
			].join(' ')}
			{...props}
		>
			{children}
		</button>
	)
}

export default PressableButton
