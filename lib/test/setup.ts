import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest doesn't auto-unmount between tests the way Jest + RTL's classic
// setup does — without this, every render() in a file stacks up in the
// same jsdom document, and queries like getByText/findByText start
// matching multiple elements across unrelated tests.
afterEach(() => {
	cleanup()
})
