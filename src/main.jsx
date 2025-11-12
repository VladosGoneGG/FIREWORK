import ReactDOM from 'react-dom/client'
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

ReactDOM.createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
)
