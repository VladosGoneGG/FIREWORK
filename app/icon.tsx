import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// No square mark exists in the brand assets (LOGO.svg is a 101×34
// wordmark — illegible squeezed into a favicon). Generated instead of
// left missing: Next.js's icon convention renders this at request time,
// no image-editing step or new binary asset required.
export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: 7,
					background: 'radial-gradient(circle at 20% 20%, #c054eb 0%, #1d0353 100%)',
					color: 'white',
					fontSize: 20,
					fontWeight: 700,
					fontFamily: 'sans-serif',
				}}
			>
				С
			</div>
		),
		size
	)
}
