import 'server-only'

// Server-only transport. The token lives only in a server-side env var —
// never NEXT_PUBLIC_*, never read by any client code, never returned in
// any response. See SECURITY_INCIDENT.md for why this matters here
// specifically: this exact call used to happen from the browser.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

export async function sendTelegramNotification(
	text: string
): Promise<{ ok: boolean; error?: string }> {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
		return { ok: false, error: 'not_configured' }
	}

	try {
		const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
		})
		if (!res.ok) return { ok: false, error: `telegram_${res.status}` }
		return { ok: true }
	} catch {
		return { ok: false, error: 'network_error' }
	}
}
