// Ported unchanged from the old app's CheckoutForm.jsx — a real business
// rule (Russian phone normalization to E.164), not implementation detail.
export function normalizeRuPhoneE164(rawPhone: string): string | null {
	const digitsOnly = String(rawPhone || '').replace(/\D/g, '')

	if (digitsOnly.length === 11) {
		return '+7' + digitsOnly.slice(-10)
	}
	if (digitsOnly.length === 10) {
		return '+7' + digitsOnly
	}

	return null
}
