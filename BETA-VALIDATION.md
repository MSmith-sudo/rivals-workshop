# Render beta preparation — validation

Prepared 2026-10-10 from `rivals-workshop-v2.4-discord-beta.zip`.

## Completed locally

- Clean locked dependency installation (`npm ci --include=dev`) succeeded.
- `npm run build:beta` passed TypeScript checking and Vite production bundling. The generated worker retires offline caching rather than precaching the beta shell.
- All 15 original test scripts passed, covering chapter state, scoring, profile migration, vault recovery, consent, portraits, dossier designs, writing/titles, provider adapters and music metadata.
- `npm run test:beta-security` passed real HTTP tests for app/asset/API authentication, production startup rejection without credentials, exact hosted host/origin checks, security headers, private uncached assets, source/secret/traversal rejection, JSON/body limits, independent tester quotas, global/daily limits, concurrency release, spoofed forwarding headers and login throttling. Cross-site document navigation from a Discord link is accepted; cross-site subrequests are rejected.
- `npm audit` reported zero known dependency vulnerabilities at the time of preparation. This is an advisory database result, not a guarantee against unknown issues.
- Full source preservation was checked against the uploaded archive. The only React source change is `src/offline.tsx`, which disables hosted offline shell caching and retires earlier workers. Every other original React source file, all public artwork and all schemas are unchanged. See `PRESERVATION.json` for the exact file comparison.

## Build note

Vite reports one JavaScript chunk above 500 kB (about 514 kB uncompressed / 161 kB gzip). This is a size advisory; the full app builds successfully. No features were removed to reduce its size.

## Validation limits

The build and automated tests ran on Windows with Node v24.18.0. The Render Blueprint requests the Node 24 line; its patch can differ. No live Render deployment, live provider request, authenticated browser walkthrough or real Discord invitation was performed. The deployment guide includes the required live acceptance steps.

Counters are per-process memory, reset on restart/redeploy, and can briefly overlap during a rolling deployment. The supplied Blueprint runs one instance. Provider-enforced hard spending/request quotas are required before paid AI. Individual tokens provide manual beta admission; they do not verify Discord roles. Already downloaded code, open pages and browser-local saves cannot be revoked remotely. Court/coach online endpoints were not present in the uploaded backend; their existing local experiences and extension boundaries are retained.

No real tester credentials or provider keys are included. Historical QA documents are retained as source context and are not claims that the new hosted beta was tested live.
