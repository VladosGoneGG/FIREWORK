import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { describe, expect, it } from 'vitest'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '../../constants/seo'
import Seo from './Seo'

function renderSeo(props) {
	render(
		<HelmetProvider>
			<Seo {...props} />
		</HelmetProvider>
	)
}

describe('Seo', () => {
	it('falls back to sensible defaults when no props are given', async () => {
		renderSeo({})
		await waitFor(() => expect(document.title).toBe(DEFAULT_TITLE))
		expect(
			document.querySelector('meta[name="description"]').content
		).toBe(DEFAULT_DESCRIPTION)
		expect(document.querySelector('link[rel="canonical"]').href).toBe(
			'https://vladosgonegg.github.io/FIREWORK/'
		)
		expect(document.querySelector('meta[name="robots"]').content).toBe(
			'index, follow'
		)
	})

	it('builds an absolute canonical URL per route and supports noindex', async () => {
		renderSeo({ title: 'Контакты', path: '/contacts', noindex: true })
		await waitFor(() => expect(document.title).toBe('Контакты'))
		expect(document.querySelector('link[rel="canonical"]').href).toBe(
			'https://vladosgonegg.github.io/FIREWORK/contacts'
		)
		expect(document.querySelector('meta[name="robots"]').content).toBe(
			'noindex, follow'
		)
	})
})
