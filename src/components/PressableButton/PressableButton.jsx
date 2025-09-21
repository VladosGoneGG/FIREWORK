import { useState } from 'react'

const PressableButton = ({ children, className = '', ...props }) => {
	const [isPressed, setIsPressed] = useState(false)

	const pressedClass = isPressed ? 'scale-98 opacity-80 !text-[#997DF5]' : ''

	return (
		<button
			className={`${className} 
        cursor-pointer
        transform
        transition-colors transition-transform transition-opacity
        duration-300 ease-out
       
        ${pressedClass}`}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseLeave={() => setIsPressed(false)}
			onTouchStart={() => setIsPressed(true)}
			onTouchEnd={() => setIsPressed(false)}
			{...props}
		>
			{children}
		</button>
	)
}

export default PressableButton
