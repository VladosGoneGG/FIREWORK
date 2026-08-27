import { memo, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import App from '../../App'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '../../constants/seo'
import useMediaQuery from '../../hooks/useMediaQuery'
import { StaticPageProvider } from '../../pages/StaticPageContext'
import { closeDetails } from '../../store/slices/detailsSlice'
import LayoutMobile from '../LayoutMobile/LayoutMobile'
import ProductDetailsOverlay from '../ProductDetailsOverlay/ProductDetailsOverlay'
import Seo from '../Seo/Seo'

const PAGE_META = {
	contacts: {
		title: `Контакты — ${DEFAULT_TITLE}`,
		description:
			'Контакты магазина салютов в Нижнем Новгороде: телефоны, адрес на Каховской 1А/С, реквизиты ИП.',
	},
	wholesale: {
		title: `Оптовикам — ${DEFAULT_TITLE}`,
		description:
			'Прайс-лист с остатками пиротехники для оптовых покупателей.',
	},
	default: {
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
	},
}

function ResponsiveRoot() {
	const isMobile = useMediaQuery('(max-width: 1040px)')
	const dispatch = useDispatch()
	const { pathname } = useLocation()

	// Определяем ключ статической страницы
	const getPageKey = () => {
		if (pathname === '/contacts') return 'contacts'
		if (pathname === '/wholesale') return 'wholesale'
		return null
	}

	const pageKey = getPageKey()
	const meta = PAGE_META[pageKey] || PAGE_META.default

	useEffect(() => {
		if (!isMobile) dispatch(closeDetails())
	}, [isMobile, dispatch])

	return (
		<StaticPageProvider value={pageKey}>
			<Seo title={meta.title} description={meta.description} path={pathname} />
			{isMobile ? <LayoutMobile /> : <App />}
			<ProductDetailsOverlay />
		</StaticPageProvider>
	)
}

export default memo(ResponsiveRoot)
