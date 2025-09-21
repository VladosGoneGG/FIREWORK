import { Component } from 'react'
import ErrorPage500 from '../ErrorPage500/ErrorPage500'

export default class ErrorBoundary extends Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	componentDidCatch(error, errorInfo) {
		console.error('Ошибка приложения:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return <ErrorPage500 />
		}
		return this.props.children
	}
}
