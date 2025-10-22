// src/components/ResponsiveRoot/ResponsiveRoot.jsx
import { memo, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import App from '../../App'
import useMediaQuery from '../../hooks/useMediaQuery'
import { closeDetails } from '../../store/slices/detailsSlice'
import LayoutMobile from '../LayoutMobile/LayoutMobile'
import ProductDetailsOverlay from '../ProductDetailsOverlay/ProductDetailsOverlay'

function ResponsiveRoot() {
	const isMobile = useMediaQuery('(max-width: 1040px)')
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		if (!isMobile) {
			// Закрыть оверлей деталей (Redux)
			dispatch(closeDetails())

			// Если где-то использовался URL-параметр ?p=..., аккуратно уберём его
			const sp = new URLSearchParams(location.search)
			if (sp.has('p')) {
				sp.delete('p')
				navigate(
					{ pathname: location.pathname, search: sp.toString() },
					{ replace: true }
				)
			}
		}
	}, [isMobile, dispatch, location.pathname, location.search, navigate])

	return (
		<>
			{isMobile ? <LayoutMobile /> : <App />}
			<ProductDetailsOverlay />
		</>
	)
}

export default memo(ResponsiveRoot)
