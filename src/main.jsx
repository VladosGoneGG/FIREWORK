import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import NotFoundPage from './components/NotFoundPage/NotFoundPage.jsx'

import ResponsiveRoot from './components/ResponsiveRoot/ResponsiveRoot.jsx'
import './index.css'

import { store } from './store/store.js'

const basename = import.meta.env.BASE_URL || '/'
const router = createBrowserRouter(
	[
		{
			path: '/',
			element: (
				<ErrorBoundary>
					<ResponsiveRoot />
				</ErrorBoundary>
			),
		},
		{
			path: '/wholesale',
			element: (
				<ErrorBoundary>
					<ResponsiveRoot />
				</ErrorBoundary>
			),
		},
		{
			path: '/contacts',
			element: (
				<ErrorBoundary>
					<ResponsiveRoot />
				</ErrorBoundary>
			),
		},
		{ path: '*', element: <NotFoundPage /> },
	],
	{ basename }
)

// The static index.html tags are a no-JS fallback for crawlers/social-bots that
// don't run React — now that React is mounting, react-helmet-async (via <Seo>)
// owns metadata, so drop the fallback to avoid duplicate/stale description,
// canonical and OG/Twitter tags across route changes.
document.querySelectorAll('[data-default-seo]').forEach(el => el.remove())

ReactDOM.createRoot(document.getElementById('root')).render(
	<HelmetProvider>
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	</HelmetProvider>
)
