import { memo } from 'react'
import App from '../../App'
import useMediaQuery from '../../hooks/useMediaQuery'
import LayoutMobile from '../LayoutMobile/LayoutMobile'

/**
 * Полностью меняет корневое дерево приложения по брейкпоинту.
 * <=1040px -> мобильная версия, иначе — десктопная (App).
 */
function ResponsiveRoot() {
	const isMobile = useMediaQuery('(max-width: 1040px)')
	return isMobile ? <LayoutMobile /> : <App />
}

export default memo(ResponsiveRoot)
