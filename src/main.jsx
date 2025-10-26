import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import NotFoundPage from './components/NotFoundPage/NotFoundPage.jsx'

import ContactsPage from './components/ContactsPage/ContactsPage.jsx'
import ResponsiveRoot from './components/ResponsiveRoot/ResponsiveRoot.jsx'
import './index.css'
import WholesalePage from './pages/WholesalePage.jsx'
import { store } from './store/store.js'

const router = createBrowserRouter([
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
				<WholesalePage />
			</ErrorBoundary>
		),
	},
	{
		path: '/contacts',
		element: (
			<ErrorBoundary>
				<ContactsPage />
			</ErrorBoundary>
		),
	},
	{ path: '*', element: <NotFoundPage /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
)
