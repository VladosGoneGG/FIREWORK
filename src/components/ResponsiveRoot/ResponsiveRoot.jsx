import { memo, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import App from '../../App'
import useMediaQuery from '../../hooks/useMediaQuery'
import { StaticPageProvider } from '../../pages/StaticPageContext'
import { closeDetails } from '../../store/slices/detailsSlice'
import LayoutMobile from '../LayoutMobile/LayoutMobile'
import ProductDetailsOverlay from '../ProductDetailsOverlay/ProductDetailsOverlay'

function ResponsiveRoot() {
	const isMobile = useMediaQuery('(max-width: 1040px)')
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const location = useLocation()

	const { pathname } = location
	const pageKey =
		pathname === '/contacts'
			? 'contacts'
			: pathname === '/wholesale'
			? 'wholesale'
			: null

	useEffect(() => {
		if (!isMobile) {
			dispatch(closeDetails())
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
		<StaticPageProvider value={pageKey}>
			{isMobile ? <LayoutMobile /> : <App />}
			<ProductDetailsOverlay />
		</StaticPageProvider>
	)
}

export default memo(ResponsiveRoot)
