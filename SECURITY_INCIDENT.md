# Security incident — Telegram bot token exposure

**Status:** code-side remediation complete. **Token revocation is a manual step and must be confirmed by the repository owner.**

## What happened

A live Telegram bot token and `chat_id` were committed in plaintext to `src/utils/orderApi.js` in commit `4a5ce8a` ("ver 0.9.9.4m"), on the branch history now merged as `origin/ver-0.6`. The repository is public on GitHub, so the token was readable by anyone from the moment that commit was pushed.

A later commit moved the token to an environment variable (`VITE_TELEGRAM_BOT_TOKEN`, `VITE_TELEGRAM_CHAT_ID`). This did **not** fix the exposure: Vite inlines every `VITE_*` variable into the client bundle at build time, so any deployment pipeline that supplied real values would have shipped the token to every visitor's browser in plaintext, indefinitely.

Found during a pre-migration codebase audit on 2026-08-25.

## Impact

Anyone holding the token could, via the Telegram Bot API:
- Read the full order history sent to that bot (customer names, phone numbers, addresses, cart contents).
- Send arbitrary messages as the shop's bot.
- Delete the bot or change its configuration, depending on scope granted at creation.

## Remediation — code side (done)

- `src/utils/orderApi.js`: removed all reading of `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` and the direct client → Telegram API call. No secret is read from, or reachable in, client code anywhere in this repository as of this commit.
- `axios` removed as a dependency — it was used only for this call.
- Verified: a production build (`npm run build`) contains no reference to `api.telegram.org`, `TELEGRAM_BOT_TOKEN`, or any token-shaped string. Checked by grepping `dist/` after build.
- `sendOrder()` now returns an honest `{ok:false, code:'transport_unavailable'}` instead of silently failing or faking success, until a real server-side transport exists (see Next.js migration plan, phase P6 — Server Action).

## Remediation — required from the repository owner (not done by this change)

1. **Revoke the token immediately** via [@BotFather](https://t.me/BotFather) → `/revoke` → select the bot. This cannot be done by an automated tool and has not been verified as complete.
2. Issue a new token. Store it only in a server-side secret store once the Server Action lands (P6) — never as `NEXT_PUBLIC_*` or `VITE_*`.
3. Review the bot's message/order history for signs of access by anyone other than the shop.
4. Decide whether the repository should remain public, independent of this fix — the token is permanently readable in git history to anyone who already cloned or mirrored the repo before revocation.
5. Confirm the old token now returns `401 Unauthorized` from the Telegram API.

## Why this can't recur the same way

Order submission moves to a Next.js Server Action in the migration (P6). Server Actions run only on the server; the token lives in a server-only environment variable and is never included in any client bundle. The client sends order data and receives a structured `{ok, orderId}` or `{ok:false, code, message}` result — it never has network access to Telegram directly, by construction, not by convention.
