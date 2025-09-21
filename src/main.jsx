import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import NotFoundPage from './components/NotFoundPage/NotFoundPage.jsx'
import './index.css'
import { store } from './store/store.js'

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<ErrorBoundary>
				<App />
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
