import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }
const fetchMock = vi.fn()

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock)
	fetchMock.mockReset()
})

afterEach(() => {
	process.env = { ...originalEnv }
	vi.unstubAllGlobals()
})

describe('sendTelegramNotification', () => {
	it('reports not_configured (and never calls fetch) when env vars are missing', async () => {
		delete process.env.TELEGRAM_BOT_TOKEN
		delete process.env.TELEGRAM_CHAT_ID
		vi.resetModules()
		const { sendTelegramNotification } = await import('./telegram')

		const result = await sendTelegramNotification('hello')
		expect(result).toEqual({ ok: false, error: 'not_configured' })
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('posts to the Telegram API with the token in the URL, not exposed to any caller-visible value', async () => {
		process.env.TELEGRAM_BOT_TOKEN = 'test-token-123'
		process.env.TELEGRAM_CHAT_ID = '-100200300'
		vi.resetModules()
		const { sendTelegramNotification } = await import('./telegram')
		fetchMock.mockResolvedValue({ ok: true })

		const result = await sendTelegramNotification('<b>order</b>')
		expect(result).toEqual({ ok: true })
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toContain('test-token-123')
		expect(JSON.parse(init.body)).toMatchObject({ chat_id: '-100200300', text: '<b>order</b>' })
	})

	it('reports failure (not a thrown error) on a non-2xx response', async () => {
		process.env.TELEGRAM_BOT_TOKEN = 'x'
		process.env.TELEGRAM_CHAT_ID = 'y'
		vi.resetModules()
		const { sendTelegramNotification } = await import('./telegram')
		fetchMock.mockResolvedValue({ ok: false, status: 401 })

		const result = await sendTelegramNotification('hi')
		expect(result.ok).toBe(false)
	})

	it('reports failure (not a thrown error) when the network call itself fails', async () => {
		process.env.TELEGRAM_BOT_TOKEN = 'x'
		process.env.TELEGRAM_CHAT_ID = 'y'
		vi.resetModules()
		const { sendTelegramNotification } = await import('./telegram')
		fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

		const result = await sendTelegramNotification('hi')
		expect(result).toEqual({ ok: false, error: 'network_error' })
	})
})
