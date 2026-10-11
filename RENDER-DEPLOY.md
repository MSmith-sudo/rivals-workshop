# Rivals Workshop 2.5 — closed Discord beta on Render

This package preserves all seven React chapters, Player Vault, portraits, dossier designs, team chemistry, writing and title assistants, music metadata, local saves, recovery and exports. One Node web service serves the built React app and relative `/api` routes from the same origin.

Beta access uses the browser's username/password prompt. Each tester receives an individual username and a generated 256-bit token as their password. Only SHA-256 token hashes are configured on the server. Production always requires credentials, regardless of `BETA_ENABLED`. This is a manually invited Discord beta: there is no Discord OAuth, bot or automatic role/membership verification.

## 1. Extract and create your repository

Extract the ZIP. Open the `rivals-workshop` folder, which contains `package.json` and `render.yaml`. Use its contents as the root of a new **private** GitHub/GitLab/Bitbucket repository. If you keep that folder inside your repository, set Render's Root Directory to `rivals-workshop` for a manual service. The simplest Blueprint setup puts `render.yaml` at the repository root.

Do not upload `.env.server`, API keys, tester tokens or captured credential output. The package includes examples only and excludes installed dependencies. Its included `dist/` is a freshly validated beta build; Render rebuilds from the source. `.gitignore` excludes generated builds and secrets from commits.

## 2. Generate individual tester credentials locally

Install Node.js 24. Open a terminal in the extracted `rivals-workshop` folder:

```sh
node scripts/beta-user.mjs alice bob charlie
```

Replace these names with unique tester aliases, not personal information. The command prints one random token per tester and a single JSON object mapping names to hashes. Keep the tokens in a password manager. Copy the **entire JSON object** for `BETA_USERS` in the next step. It must be one object, with double quotes, without surrounding single quotes. Do not paste the explanatory lines. Never use manually chosen passwords with this fast hash; the generator provides the necessary high entropy.

Share each tester's username and token privately, only after you verify their Discord membership. The HTTPS app URL can go in your closed beta channel. Do not embed credentials in the URL or post a shared password in the channel. Treat tokens as invitations that can be forwarded; revoke compromised accounts.

## 3. Deploy with the included Blueprint

1. Sign in to Render and connect the private repository.
2. Choose **New > Blueprint** and select that repository/branch.
3. Review the `rivals-workshop-beta` web service. The supplied `starter` plan is paid; review Render's displayed price before creating it. The configuration runs one instance. You can choose a free web service manually, but cold starts and resets are less suitable for a scheduled beta.
4. Enter the generated JSON as the prompted **BETA_USERS** value. It is deliberately absent from `render.yaml` (`sync: false`).
5. Create the Blueprint and wait for the build and health check to pass.
6. Open the assigned HTTPS `onrender.com` URL in a normal browser or a fresh private window. Enter a generated username and its token in the browser's login prompt.

The configuration sets Node's major version to `24` so Render selects an available patch in that line. It installs development dependencies needed by the build even with `NODE_ENV=production`.

## Alternative: create a Web Service manually

Choose **New > Web Service**, connect the repository, and use:

| Setting | Value |
| --- | --- |
| Language / runtime | Node |
| Root Directory | Blank if `package.json` is at root; otherwise `rivals-workshop` |
| Build Command | `npm ci --include=dev && npm run build:beta` |
| Start Command | `npm start` |
| Health Check Path | `/healthz` |
| Instances | 1; do not enable autoscaling |
| NODE_VERSION | `24` |
| NODE_ENV | `production` |
| VITE_CLOSED_BETA | `true` |
| BETA_USERS | Generated JSON object |
| AI_PROVIDER | `offline` initially |
| BETA_REQUESTS_PER_MINUTE | `10` |
| BETA_REQUESTS_PER_DAY | `100` |
| BETA_GLOBAL_REQUESTS_PER_DAY | `500` |
| BETA_MAX_CONCURRENT | `2` |

Render supplies `PORT`; do not hardcode it or set `HOST=127.0.0.1`. Production binds to `0.0.0.0`. Do not use Vite's development/preview server or deploy only `dist/` as a Static Site: the Node server enforces the access gate and APIs.

## 4. Confirm the live beta before inviting people

1. `/healthz` must return `{"ok":true}` without credentials. This is the only public endpoint and exposes no provider or tester information.
2. In a new private window, `/`, `/api/config`, `/flame.svg` and `/sw.js` must require credentials. Canceling the prompt returns 401. An unauthorized POST to `/api/companion` or `/api/music` must also return 401.
3. Log in as a tester. Check all seven chapters, save/restore, portraits, dossier printing, exports and consenting team profiles. Save a backup, reload, and confirm the local draft survives.
4. Confirm `/api/config` reports `configured: false` while AI is offline. Local reflection still works. No keys or credential hashes should appear in its response.
5. After optional AI setup, test with nonsensitive example text and explicitly approve the reviewed payload. Confirm 429 errors show a retry delay instead of automatically retrying.
6. Check the browser console for errors. Prefer a full browser opened from Discord; embedded browsers may handle HTTP authentication inconsistently.

Use a **fresh hostname** for the first closed beta. The original app can cache an offline shell. A previously installed worker can serve that old shell before a new access gate is reached. The beta build disables shell caching and provides a network-only worker that purges earlier workshop caches, but cannot remotely erase a revoked tester's downloaded code, already open tab or browser saves. On an old origin, export saves first and remove its service worker/cache in browser site settings before testing. Moving localhost saves to Render requires exporting and importing the existing JSON backups; portraits remain separate, as in the original release.

## 5. Enable optional AI only when ready

The default beta is offline for AI. YouTube metadata still works when a tester explicitly consents to sending a supported video link. To enable Gemini, set these in Render's **Environment** tab and save/redeploy:

```text
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash-lite
GEMINI_API_KEY=<your server-side provider key>
```

Confirm your account supports the selected model and its terms/quotas before enabling it. Existing OpenAI, OpenRouter and HTTPS-compatible adapters remain available; see `env.example` for their variables. Never put provider keys in `VITE_*`, frontend files, Git or a Discord message. The existing explicit per-request consent, evidence validation and provider disclosures remain intact. Court objections and combat coaching are pre-existing future-backend extension boundaries; their local activities work, but these two optional online endpoints are not implemented in the uploaded release or added here.

## Limits and spending controls

Both POST endpoints share each tester's quota: 10 accepted requests per minute, 100 per UTC day, a service-wide 500 per UTC day and at most 2 concurrent requests. Malformed, offline and failed-provider requests consume quota once admitted; no automatic retry is added. Rejections return HTTP 429 and `Retry-After`. Authentication failures have a separate global limit of 100 per minute, including missing credentials; heavy unauthenticated traffic may temporarily block all logins. This is a small-beta safeguard, not a replacement for edge abuse controls.

Limits use authenticated usernames. Client-supplied `X-Forwarded-For` cannot reset a tester's quota. The server ignores forwarded IP headers entirely.

**Counters are in memory.** They reset on restart, redeploy or UTC date change, and are independent during overlapping deployments or on multiple instances. Keep one instance, avoid autoscaling, and set a provider-enforced hard request/spending quota before enabling paid AI. Request counts are not dollar budgets. If persistent quotas or a larger beta are needed, add a shared store and edge abuse protection before scaling.

## Revoke, rotate, pause and update

- To revoke a tester, remove their name/hash from `BETA_USERS`, save and redeploy. After the new process is live, their old credential receives 401 on subsequent network requests. Already accepted in-flight work may finish.
- To rotate one credential or add a tester, run the generator with that name only, then merge its name/hash entry into the existing JSON object. Replacing the entire object with this one entry revokes everyone else. Share the new token privately.
- Browsers cache HTTP Basic credentials and provide no reliable app-controlled logout. Test revocation in a fresh private window; close all private windows to end a private testing session. Use dedicated browser profiles on shared devices and clear saved site data when appropriate, after exporting backups.
- To pause AI spending, set `AI_PROVIDER=offline` and redeploy. To close the entire beta, suspend the Render service. An empty `BETA_USERS` prevents startup and fails health checks; it is not a graceful pause mechanism.
- For updates, run the checks below, commit and deploy. Ask testers to export backups before a significant update. Review the currently selected branch and Render auto-deploy setting. Do not roll back to the original unprotected server.
- For a custom domain, set `APP_ORIGIN` to exactly `https://your-domain.example`, with no trailing slash or path, and redeploy. Only that configured host is accepted. Otherwise leave `APP_ORIGIN` unset: the app derives it from `RENDER_EXTERNAL_URL`. Never copy the localhost `APP_ORIGIN` from `env.example` into Render.

## Reproduce validation locally

```sh
npm ci --include=dev
npm run build:beta
npm test
npm run test:beta-security
npm run test:mobile
npm audit
```

`npm start` does not automatically load `.env.server`; Render injects variables. For a local protected beta smoke test, create an untracked `.env.server` containing `BETA_ENABLED=true`, generated `BETA_USERS`, `APP_ORIGIN=http://127.0.0.1:8787` and `AI_PROVIDER=offline`, then run `npm run server` and open `http://127.0.0.1:8787`. Production requires an HTTPS origin; do not use production mode for this HTTP localhost test.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Startup fails with BETA_USERS error | JSON must contain 1–200 aliases mapped to 64-character lowercase hex hashes from the generator. Production cannot disable the gate. |
| Host/origin rejected (403) | Remove a stale localhost APP_ORIGIN. Check the exact HTTPS origin/custom hostname. Open the app directly in a browser. |
| Render cannot detect a port | Use `npm start`, let Render supply PORT, and remove a localhost HOST override. |
| Build cannot find TypeScript/Vite | Use `npm ci --include=dev` and the exact beta build command. |
| Login keeps failing | Use the plaintext generated token as password, not its hash. Check username case. Use a fresh browser session after rotating. |
| 429 | Wait the Retry-After interval; check daily/global counters, concurrent work or login failures. Provider 429 may also be propagated. |
| Optional AI unavailable | Check provider/model/key and upstream quotas. Keys remain server-side; local reflection remains available. |
| Old app appears without login | Old service worker, cached tab or wrong hostname. Export saves, clear the old worker/cache, then test a fresh private window and fresh beta hostname. |

Render references checked for this preparation: [Web Services](https://render.com/docs/web-services), [Blueprint specification](https://render.com/docs/blueprint-spec), [Node version](https://render.com/docs/node-version), [Environment variables](https://render.com/docs/environment-variables), [Health checks](https://render.com/docs/health-checks).

## Mobile PWA release checks

See V2.5-MOBILE-SETUP.md and V2.5-QA.md. The beta worker remains registered for installation, but never caches or intercepts authenticated pages, assets or API requests. Ordinary HTTPS links continue to work without installation. Test actual Safari, Chrome and Discord webviews on the deployed hostname before inviting all testers. If Discord does not show a Basic login prompt, use Open in Browser.
