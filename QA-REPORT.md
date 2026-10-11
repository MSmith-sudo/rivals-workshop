# Rivals Workshop 2.1 — QA report

Checked October 10, 2026. Original input: rivals-workshop-v2-mvp.zip.

## Delivered

- Version 3 Player Vault with V2 migration, preserved originals, previous-save and pre-load backups, revision conflict checks, consent reset on import/export and raw recovery download.
- Team Chemistry for 2–6 consenting profiles: included Chapter 1 role declarations, dynamic group names, conditional synergy/friction from matching Chapter 5 scenarios, contextual receipts, saved selections and JSON export.
- Multi-turn Gemini backend with configurable gemini-2.5-flash-lite; optional OpenRouter and retained legacy adapters; server-only keys; request consent, payload/history validation, timeout and 429 handling, citation validation, provider/model disclosure and local conversation controls.
- Clearly labeled authored offline reflection, production offline shell, responsive controls, keyboard focus styling, status announcements and reduced-motion support.
- env.example and LOCAL-START.md with startup, configuration, privacy, recovery and troubleshooting instructions.

## Passed

- Baseline tests and production build before changes.
- Final npm test: all 11 chained test suites pass, including existing chapter regressions and new vault/Gemini tests. Chapter 4 regression suite covers 162 encounter branches.
- Final npm run build: TypeScript check, Vite production bundle and five-asset offline shell succeed. JavaScript bundle 470.28 kB / 147.53 kB gzip; CSS 34.60 kB / 7.97 kB gzip.
- Locked dependency installation: 69 packages installed; audit reported zero vulnerabilities at installation. No runtime dependency was added. Tested with Node 24.18.0 / npm 11.16.0.
- V2 migration idempotence, original chapter preservation, previous vault backup, stale-revision rejection, corrupt migration isolation, quota errors, import consent reset and team bounds.
- Role coverage separates active declarations, skipped selections, retained-but-not-played picks and missing answers. Preferred role alone is excluded. Team names are stable under member reordering and change for different tested groups.
- Matching social responses produce conditional pair comparisons with retained receipts; skipped answers do not contribute.
- Local conversation history isolation, scope mismatch exclusion, history validation and stored history deletion.
- Local HTTP tests: origin/host protection, missing-consent rejection, oversized payload/rate boundaries, no secret in public configuration, provider 429 propagation and static-source exclusion.
- Mocked Gemini/OpenRouter requests: correct multi-turn roles, default/configured model, API key header, valid/invalid citations, empty provider response, authentication/network errors and retry hints.
- Browser: vault opens, profile creation and persistence after reload, two-turn offline reflection, disabled AI send when unconfigured, chapter-selection/consent controls, and offline update activation preserving the vault.
- Responsive browser inspection at 390 × 844 and 1280 × 900. Mobile document width did not exceed viewport width. Visible labels and focus ring checked; no complete assistive-technology audit performed.
- With the backend stopped, the cached production app reloads, reopens the saved vault and generates a local reflection without connectivity.
- SHA-256 comparisons: all seven ChapterOne–ChapterSeven components plus flame.svg and rivals-splash.png exactly match the original archive.

## Limits

No real Gemini/OpenRouter API request was made because no key was supplied. Adapter and error paths use mocks; account/model availability, quota, billing and real model behavior need verification with the user's key. Citation validation establishes valid references, not factual correctness of all AI prose. Team interpretations are self-report/authored reflection, not observed gameplay, verified hero combos or win predictions.

Offline reload requires one successful prior production visit. Browser storage is origin-bound and subject to quota; vault conflict checks are best effort, not an atomic cross-tab lock. Historical V2/previous-save backups intentionally retain data and must be cleared with site data if complete local erasure is wanted. Conversation deletion cannot erase provider-held copies. The server is loopback-only local software, not a public authenticated service.

No secrets were embedded. No personal chapter data was sent to a provider. No deployment was performed. ZIP includes source, lockfile, tests, built assets, schemas and setup guide; node_modules, private environment files and test scratch files are excluded.
