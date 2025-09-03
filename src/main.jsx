import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import ProductDetails from './components/ProductDetails/ProductDetails'
import './index.css'
import { store } from './store/store.js'

const router = createBrowserRouter([
	{ path: '/', element: <App /> },
	{ path: '/product/:id', element: <ProductDetails /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
)
