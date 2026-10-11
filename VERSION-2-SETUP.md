> V2.2: Start with [V2.2-SETUP.md](V2.2-SETUP.md). See [V2.2-CHANGELOG.md](V2.2-CHANGELOG.md) and [V2.2-QA.md](V2.2-QA.md). Earlier notes below describe the original release.

> Historical V2 notes. For the current V2.1 release, configuration, consent, version 3 vault and multi-turn companion, follow LOCAL-START.md.

# Find Your Flame — Version 2 MVP

This extends the supplied complete Chapter 7 archive. All seven chapter components and their answer keys remain in place. Open **Profiles & squad studio** from the home navigation, or `/#studio`.

## Run locally

Use Node.js 22 or newer. In the extracted project folder:

```
npm ci
npm run dev
```

Open the address printed by Vite. Use the same browser and origin as your earlier workshop to access its localStorage; changing the host or port gives you a different browser save area. If necessary, export earlier chapter backups from the old origin, import them through their existing chapters at the new origin, then open the profile library.

`npm test` runs original chapter regressions plus profile and proxy checks. `npm run build` typechecks and creates the production `dist/` with the offline shell. `npm run preview` serves the build. Do not rely on opening index.html directly from disk.

## Profiles and teams

Open the library to migrate existing Chapter 1–6 saves once; original keys stay unchanged. Chapter 7 has no separate answer save and is derived from those chapters. New saved profiles capture current workspace answers. Rename edits metadata. To edit chapter answers, load the profile, use the existing chapters, return to the studio, select that profile and choose **Update from current chapters**. Its original snapshot remains exportable. Save any active workspace progress before loading another profile.

Profiles and team membership are private in localStorage. Deleting a saved profile removes that snapshot, not the active chapter workspace. Export before deletion if you need recovery. JSON exports contain answers, so keep them private unless the player agrees to disclosure. Imports validate the version, structure, size and chapter compatibility, assign new IDs and clear team consent; they append without overwriting existing profiles. Future library versions are rejected rather than guessed. Failed migration/import leaves stored data intact. Storage errors are shown in the interface.

Each player must agree to team analysis and dossier export. Select 2–6 consenting profiles. Save/load the group locally; loading rechecks current consent. The dossier combines declared role coverage, chapter-specific shared/differing habits, costs, contexts, member receipts and coordination experiments. Missing answers stay unknown. Team names are playful authored suggestions. Export JSON to share manually; no hosting link or automatic sharing is created. Removing consent cannot recall a file already exported to another person.

## Optional AI — requires server configuration and API key

The app works without AI. Its local narrative is explicitly deterministic authored reflection, never a fabricated AI conversation. For AI, copy `.env.server.example` to `.env.server`, set `AI_PROVIDER=openai`, an accessible `AI_MODEL`, and `AI_API_KEY` **only in that server file**, then run in another terminal:

```
npm run server
```

Use `AI_PROVIDER=compatible` plus an HTTPS `AI_BASE_URL` ending in `/v1` for a provider implementing the chat/completions protocol. `offline` is the default. No model is silently chosen. Provider compatibility must be verified against that provider's documentation and a live request. Responses must be JSON with `text` and valid `citations` such as `["E1"]`; malformed/uncited responses are rejected. The frontend renders text, not HTML. The OpenAI adapter uses the [official Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) and `store:false`; this disables response application storage, not all provider retention policies.

Set APP_ORIGIN to your actual frontend origin, including the port (Vite may choose another free port). The development server forwards `/api/companion` to loopback port 8787. If PORT changes, update the Vite proxy too. Select chapters, review the exact question/tone/receipt payload, and consent for each request. No saved nickname, original archive or unselected answers are transmitted. Free-text receipts can still contain identifying information. AI permissions reset when profiles or answer selection change; responses are memory-only and can be cleared. No conversation history is sent. Citations establish which supplied receipts were referenced, not proof that every interpretation is correct. Check the receipts yourself.

The proxy has request validation, body limits, a timeout, origin checks, no prompt/response logging, no response caching, and a modest in-memory request limit. Its key never enters the client bundle. The test suite uses mocked provider transports and real local HTTP requests; no live provider interaction was performed.

## Deployment is separate

Nothing was deployed. The built frontend can be served statically for local profiles and teams. AI requires a running backend with server-managed secrets and a same-origin `/api/companion` reverse proxy. Keep the backend bound to loopback; set the public APP_ORIGIN, enforce HTTPS, and add authenticated access and persistent per-user quotas at the hosting gateway before exposing paid AI publicly. Origin checks alone do not authenticate a caller. Configure hosting to avoid recording request bodies. Agree provider, model, retention policy, access model and host before deploying. Never use VITE_ variables for secrets.

## Validation limits

Version 2 library validation lives in `src/profileStore.ts`; provider request/response validation lives in `server/companion.mjs`. Supported library schema is `rivals-workshop.library`, version 2; each profile contains six nullable raw JSON chapter snapshots, six immutable original snapshots, timestamps, ID, name, and explicit team consent. Chapter compatibility uses the established decoders; unknown chapter fields are retained in snapshots but not treated as evidence. This is a functional MVP, with local single-browser storage rather than accounts or cross-device sync. Group chemistry has no predictive accuracy claim. The original artwork and chapter styling remain; the studio adds responsive controls and visible keyboard focus.

