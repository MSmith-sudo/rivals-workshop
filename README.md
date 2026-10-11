# Rivals Workshop v2.5 — mobile edition

Start with [V2.5-MOBILE-SETUP.md](V2.5-MOBILE-SETUP.md), [RENDER-DEPLOY.md](RENDER-DEPLOY.md), and the verification results in [V2.5-QA.md](V2.5-QA.md). This package upgrades the supplied beta in place and includes a prebuilt private-beta dist folder.

# Rivals Workshop 2.4 — Discord Beta Visual Polish

**Render closed beta:** start with [RENDER-DEPLOY.md](RENDER-DEPLOY.md). This prepared package includes the full app, a protected production server, `render.yaml`, individual tester credential generation, and security tests. Hosted beta builds disable offline shell caching; browser saves and exports are preserved. Earlier setup and QA documents below describe the original local release.

Includes all seven chapters, the Player Vault and original save formats, Gemini and offline reflection, soundtrack previews, narrative writing, creative titles, team chemistry, recovery and exports.

## Run the included production build

Install Node.js 22.18 or newer (Node 24 recommended). Extract the entire ZIP, open the rivals-workshop folder, then double-click START-WORKSHOP.cmd on Windows. Open http://127.0.0.1:8787. Keep the terminal open while playing. The prebuilt app and server do not require npm installation to run. Default AI mode is offline.

On any supported system, from the extracted project folder:

```text
node --env-file-if-exists=.env.server server/companion.mjs
```

Set APP_ORIGIN=http://127.0.0.1:8787 in .env.server when enabling Gemini against the included production build. START-WORKSHOP.cmd sets this origin for its own process. Copy .env.server.example to .env.server and follow V2.3-SETUP.md for existing Gemini/provider setup. Keys stay on the server. Each existing transmission review/consent flow remains in place.

## Develop and test

```text
npm ci
npm test
npm run build
npm run dev
```

The native configuration loader requires Node 22.18+. The original proxy and backend commands remain available. The ZIP excludes installed dependencies and real credentials.

## What changed

- Character portraits: open Player Vault & squad studio, open your private library, then use Your hero portrait library. Choose any of the 54 characters in the supplied roster and upload PNG, JPEG or WebP artwork. Images crop to 320 × 400 and save on this browser. Local raster portraits override the bundled registry. Invalid/broken images fall back to the original role illustration. Uploads are limited to 8 MB; oversized encoded results and failed/quota-limited saves report an error. Removing a custom image restores the registry or role artwork.
- Character-specific colors: authored colors for every hero in the supplied roster appear on portrait frames and the featured-main dossier accent. They do not affect scoring.
- Four final dossier designs: Chapter 7 → Your integrated dossier → Cinematic spotlight, Classified field file, Comic cover or Cosmic constellation. Same evidence, four distinct compositions. Includes your mains, current titles, local story, tradeoff and growth challenge. The design choice persists independently of chapter saves. Print / Save as PDF isolates the designed card for sharing with your Discord group.
- Seven cinematic chapter scenes: original local vector environments for the roster room, court, observatory, simulation floor, comms channel, soundtrack booth and reveal chamber. These load offline without external artwork requests.
- Team Chemistry collages: select 2–6 consenting saved profiles in Group chemistry studio. Collages show up to three included mains per member. Profiles without mains receive an honest empty state. Revoked consent removes the member immediately; fewer than two consenting members hides group output.

## Upgrade without losing profiles

Export your library and chapter backups from the old app first. Use the same browser and exact origin (scheme, hostname and port) to retain local saves. A new folder alone does not transfer browser storage to a different origin. Import the existing JSON backups if changing origins. Existing chapter keys, profile schemas and scoring rules are unchanged. The included offline updater still asks you to finish your run and export backups before applying updates.

Portraits and the dossier design preference are separate browser settings; existing profile/library JSON exports do not include them. Keep original artwork files to re-upload on another browser. You can instead bundle permitted local artwork under public/media and edit src/hero-media.json as documented in ASSET-RIGHTS.md, then rebuild. No official character artwork is included in this update; original role artwork and initials remain the fallback until you supply portraits.

## Verification

See V2.4-QA.md for completed checks and limitations. Historical setup/QA documents are retained for the earlier versions.
