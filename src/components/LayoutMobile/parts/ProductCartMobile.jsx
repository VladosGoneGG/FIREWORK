import { memo } from 'react'
import { useSelector } from 'react-redux'
import IconCartMobile from '../../IconCartMobile/IconCartMobile'

// Сумма количества по всем позициям
const selectCartCount = s =>
	(s?.cart?.items || []).reduce(
		(sum, it) => sum + (Number(it?.quantity) || 0),
		0
	)

function ProductCartMobile({ onOpen }) {
	const count = useSelector(selectCartCount) // ← гарантированный ререндер при изменениях

	return (
		<div className='flex'>
			<IconCartMobile count={count} onClick={onOpen} />
		</div>
	)
}

export default memo(ProductCartMobile)
