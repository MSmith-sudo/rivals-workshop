> V2.2: Start with [V2.2-SETUP.md](V2.2-SETUP.md). See [V2.2-CHANGELOG.md](V2.2-CHANGELOG.md) and [V2.2-QA.md](V2.2-QA.md). Earlier notes below describe the original release.

# Rivals Workshop 2.1 — local startup and configuration

All seven original chapters and the Find Your Flame branding remain. Chapter 7 continues to derive its portrait from Chapters 1–6. Player Vault, team analysis and local reflections work without an API key. This package has not been deployed.

## Requirements and first launch

Use Node.js 22.9+ (Node 24 LTS recommended) and npm. Extract the ZIP into a folder, open a terminal in `rivals-workshop`, and run:

```powershell
npm ci
Copy-Item env.example .env.server
npm test
npm run build
```

For development, open two terminals in the same project folder:

```powershell
# Terminal 1
npm run server
# Terminal 2
npm run dev
```

Open http://127.0.0.1:5173. The development server forwards `/api` to the backend at port 8787. Keep `APP_ORIGIN=http://127.0.0.1:5173` in `.env.server`. The frontend port is strict so it will report an occupied port instead of silently changing origins.

For the production build with offline installation, change `.env.server` to `APP_ORIGIN=http://127.0.0.1:8787`, then run only `npm run server`. Open http://127.0.0.1:8787. The backend serves only `dist`, never environment files or project source. It binds to loopback and is intended for local use. `npm run preview` can preview the offline build but does not connect the AI backend. Do not open `dist/index.html` directly as a file: use the local server.

## Optional Gemini companion

Create an API key in Google AI Studio: https://aistudio.google.com/apikey. Enter it yourself in `.env.server`:

```dotenv
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash-lite
GEMINI_API_KEY=YOUR_OWN_KEY
```

Restart the backend after any configuration change and reload the companion page. Keys stay in backend environment variables. Never prefix keys with `VITE_`, put them in React code, paste them into the app, or commit them. `env.example` contains no key, and `.env.server` is ignored. The model is configurable because model availability and account limits can change. No automatic model switching, paid fallback, retries, tools, web grounding or provider-side conversation session is used.

The Gemini adapter uses the official `generateContent` endpoint, system instructions, alternating user/model history and JSON response mode. Replies must include valid inline receipt IDs. Validation checks citation existence and consistency; it cannot prove the truth of every model interpretation. Treat AI advice as a hypothesis.

Google's pricing page lists Gemini 2.5 Flash-Lite with a free tier as checked on October 10, 2026. Availability, regions and quotas are account-dependent and are not guaranteed by this app. Unpaid services may use submitted prompts and generated replies to improve Google products and machine learning technologies, and human reviewers may process content. Do not submit confidential, sensitive or personal information. Regional/account exceptions are governed by Google's current terms. Verify your own account's billing setting; this app cannot enforce a free billing tier. Sources:

- https://ai.google.dev/gemini-api/docs/pricing#gemini-2.5-flash-lite
- https://ai.google.dev/gemini-api/terms
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/rate-limits

The UI displays the configured provider/model and data-use disclosure. Select a profile, choose Real AI provider, choose which chapters to include, review the exact payload, and explicitly opt in before every send. Only the question, tone, selected answer receipts and up to six prior exchanges go out. Profile names are omitted from receipt metadata, but prose and prior turns may identify you. Consent is never imported, automatically enabled, or stored for future requests. The server rejects requests without `consent:true`; this is an application consent boundary, not authentication for public hosting.

## Optional OpenRouter and legacy adapters

```dotenv
AI_PROVIDER=openrouter
AI_MODEL=YOUR_OPENROUTER_MODEL_ID
AI_API_KEY=YOUR_OWN_KEY
GEMINI_API_KEY=
```

OpenRouter uses its fixed HTTPS chat-completions endpoint. The adapter asks for JSON and requests providers that deny data collection. A route or model may not support those requirements and will fail visibly. Free-model IDs and availability vary; choose one from your account and review both OpenRouter and underlying provider terms. Nothing in this app guarantees OpenRouter is free. See https://openrouter.ai/docs/api_reference/overview and https://openrouter.ai/docs/features/privacy-and-logging.

Existing `openai` and `compatible` configurations remain supported. They use `AI_API_KEY` and `AI_MODEL`; `compatible` additionally requires an HTTPS `AI_BASE_URL`. These options may cost money. The OpenAI adapter requests `store:false`. Endpoint configuration belongs only to the local server operator; no user-supplied frontend URL or key is accepted.

## Offline behavior and errors

Default `AI_PROVIDER=offline` requires no secrets. The companion starts in **Local / offline reflection**, labeled as authored rules, not generative AI. It selects relevant saved receipts by topic and offers authored practice steps. Team dossiers and profile import/export are fully local.

The production build includes a service worker. Visit once while the local server is running and wait for “Offline workshop ready.” The installed shell and local data can then work without connectivity. A first-ever offline visit cannot load uncached assets. API requests and responses are never cached. Keep the same browser origin and profile for saved data. Offline operation is not guaranteed in browser private modes that disable storage/service workers.

429 responses show a retry countdown using the provider's retry hint (capped at one hour, default one minute). The server also limits local calls to ten per minute. Authentication/model errors, timeouts, network failures, blocked/empty model replies and invalid citations show a failure message; they never manufacture a provider answer. Local reflection remains selectable. No automatic provider retry spends quota. If AI is not configured, its send button is disabled. If configuration changes while a page is open, reload it.

## Player Vault, preservation and recovery

- Version 3 uses `rivals-workshop.profiles.v3`. On first opening it reads the V2 library or snapshots current Chapter 1–6 saves. The original V2 key and chapter keys remain intact. Migration is idempotent; unsupported/corrupt saves are not replaced.
- Profiles retain immutable original snapshots alongside editable current snapshots. Chapter 7 is recomputed and its existing chapter behavior remains intact. Import accepts V2/V3, assigns new profile IDs and clears group consent. Exports also clear group consent.
- Maximum 50 profiles, 16 MB per library/import, 300,000 characters per chapter snapshot. Browser quota may be smaller. Save failures appear in the UI; export before clearing browser data.
- Each vault save preserves the previous version in `rivals-workshop.profiles.v3.backup`. Revision checking rejects stale writes from another tab; use Reopen vault to refresh. This is best-effort conflict detection, not a cross-tab transaction lock. Keep one editing tab for simultaneous changes.
- Loading a profile replaces the active chapter workspace. Save it as a profile or export first. A pre-load backup is kept in `rivals-workshop.restore-backup.v1`; failed loads attempt rollback. The backup is still sensitive local data.
- If opening a corrupted vault fails, use **Download raw vault recovery** before clearing anything. It includes raw current/previous/V2 vault strings and the pre-load workspace backup. A valid previous vault can be imported through the normal importer after repairing/removing the corrupt current key using browser storage tools. The raw recovery bundle itself is not a profile import; do not send it to AI.
- Data is bound to origin (scheme, host, port). Switching between `localhost`, `127.0.0.1`, development and built-app ports creates a separate store. Move data using export/import. No account or cloud synchronization is implemented.
- Local group consent controls inclusion and export. Select 2–6 distinct consenting profiles. “Save group selection” stores member IDs; dossiers are regenerated from current permitted snapshots. Delete selection or revoke consent to remove members. Role coverage includes only active, unskipped Chapter 1 main selections, and separates declared, skipped, not-played and unanswered roles. A preferred role alone never counts as coverage.
- Pairwise synergy/friction compares matching answered Chapter 5 authored scenarios. Other included chapter receipts contextualize each member. Missing evidence remains explicit. No hero combo bonus, live patch claim or win-rate prediction is generated. Names vary deterministically with the group and included answer traits; naming is playful, not a score.

## Local conversation controls

History is memory-only by default. “Save the last six exchanges on this browser” explicitly enables local persistence for that profile and exact evidence context. Switching profile, saved snapshot, tone, chapters or mode starts a separate context; incompatible stored history is not transmitted. Changing a question revokes consent without losing prior turns.

Unchecking history saving removes the persisted conversation and keeps the current visit in memory. Delete conversation cancels pending requests, clears current history and removes the stored profile conversation. Leaving the companion also cancels the client request. A cancellation cannot recall data already delivered to a provider. Profile deletion removes its local conversation, but previous vault backups/V2 migration sources may still retain profile data. Clearing browser site data removes those local backups as well. Deletion here never promises deletion of third-party copies.

## Validation and troubleshooting

`npm test` runs chapter regressions, migration/role/consent/history tests and real local HTTP tests with mocked provider transports. `npm run build` performs TypeScript checking, production compilation and offline shell generation. No API key is required for these checks. No live Gemini/OpenRouter call was made during delivery QA.

If the server reports an occupied port, stop that process or change `PORT`, the Vite proxy and `APP_ORIGIN` consistently. 403 indicates the host/origin does not match configuration. 413 indicates excessive receipts/history; send fewer chapters or delete conversation. 429 may indicate a daily quota, not just a short delay: consult AI Studio. 502 means the answer failed validation; 503 means offline, configuration, network, timeout or upstream failure. Inspect server configuration, never print API keys to logs.

Before any public deployment, add appropriate authentication, persistent shared rate limiting, deployment-specific origin/host rules and a privacy review. No deployment is authorized or included.
