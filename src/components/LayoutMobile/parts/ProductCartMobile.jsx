import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import IconCartMobile from '../../IconCartMobile/IconCartMobile'

// Суммируем количество всех позиций в корзине
const selectCartCount = s =>
	(s.cart?.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)

function ProductCartMobile({ onOpen }) {
	const count = useSelector(selectCartCount)

	// мемо на всякий случай, чтобы не дёргать перерисовку без надобности
	const safeCount = useMemo(() => (Number.isFinite(count) ? count : 0), [count])

	return (
		<div className='flex'>
			<IconCartMobile
				count={safeCount}
				onClick={onOpen /* можно передать экшен открытия корзины */}
			/>
		</div>
	)
}

export default memo(ProductCartMobile)
