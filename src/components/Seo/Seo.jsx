import { Helmet } from 'react-helmet-async'
import {
	DEFAULT_DESCRIPTION,
	DEFAULT_TITLE,
	SITE_NAME,
	SITE_URL,
} from '../../constants/seo'

/**
 * Reusable per-route metadata. Only the 3 real routes (/, /contacts, /wholesale)
 * exist today, so this stays intentionally simple — no per-filter/per-category
 * variants, since none of that state is URL-addressable (see audit notes).
 */
export default function Seo({
	title = DEFAULT_TITLE,
	description = DEFAULT_DESCRIPTION,
	path = '/',
	noindex = false,
}) {
	const canonical = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`

	return (
		<Helmet>
			<html lang='ru' />
			<title>{title}</title>
			<meta name='description' content={description} />
			<link rel='canonical' href={canonical} />
			<meta name='robots' content={noindex ? 'noindex, follow' : 'index, follow'} />

			<meta property='og:type' content='website' />
			<meta property='og:site_name' content={SITE_NAME} />
			<meta property='og:title' content={title} />
			<meta property='og:description' content={description} />
			<meta property='og:url' content={canonical} />

			<meta name='twitter:card' content='summary' />
			<meta name='twitter:title' content={title} />
			<meta name='twitter:description' content={description} />
		</Helmet>
	)
}
