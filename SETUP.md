> V2.2: Start with [V2.2-SETUP.md](V2.2-SETUP.md). See [V2.2-CHANGELOG.md](V2.2-CHANGELOG.md) and [V2.2-QA.md](V2.2-QA.md). Earlier notes below describe the original release.

> Historical V2 notes. For the current V2.1 release, configuration, consent, version 3 vault and multi-turn companion, follow LOCAL-START.md.

# Setup — Rivals Workshop

Use Node.js 22.12 or later (validated with Node 24). Extract the ZIP and open a terminal inside the rivals-workshop folder.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Chapters 1–7 are available on the homepage. Trial by Combat opens at /#chapter-4. Internet access is needed for installation; the workshop uses no API keys or backend. The production build installs an offline shell cache; after the offline-ready notice it supports reload without the server. Development mode requires the server.

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

dist/ contains the ready-to-serve production build. Serve it over HTTP; double-clicking index.html is not supported. node_modules is intentionally omitted.

## Saves and migration

Use the same browser and exact origin (scheme, hostname and port) as before. localhost and 127.0.0.1 have separate storage, as do different ports. ZIP files do not carry browser saves.

Chapter 3 continues using rivals-workshop.chapter3.v1, with schema version 2 inside the save. Old progress migrates automatically when Chapter 3 opens. The full old payload is retained in an expandable archive and the downloadable JSON profile. Matching categories keep drafts; ambiguous removed categories and changed scenarios remain archived rather than reinterpreted. Review Mirror Test and retake changed scenarios before marking complete. Stage, confidence, rationales and skipped markers remain available. Chapters 1 and 2 and nickname storage are untouched.

Download profile & answers on the final stage creates a backup including the migration archive and provisional diagnosis. Chapter 4 has its own combat-backup JSON import/export; Chapter 1–3 profile import is not implemented. Clearing browser storage removes saves. If storage is blocked, the app displays a warning and keeps current answers only during the visit.

## Offline feedback

Interrogation uses deterministic English pattern checks and discipline-specific questions. It cannot understand or verify a match, and wording does not score skill. Diagnosis uses one fixed authored scenario per discipline and keeps uncertainty explicit. Its identity title is provisional; Chapter 7 combines available answers using transparent local rules.

See CHANGELOG.md for changes and validation scope. UI-CHECKS.json records the browser results; automated state tests ship in scripts/.

## Chapter 4

See CHAPTER-4.md for versioned saves, replay, rehearsal and the future narrative-coach transport. Serve dist/ after building for offline reload support. Use the same origin to retain existing browser saves.

## Chapter 6 — The Soundtrack of Your Legend

All seven chapters are available from the homepage; Chapter 6 opens at /#chapter-6. Use Node.js 22.12+ and run npm ci, npm run dev from this folder. Keep the same browser, hostname and port to retain existing saves. For production run npm run build and npm run preview; serve dist over HTTP.

Chapter 6 has five editable stages, optional skips, song metadata, mood tags, scene/reason prompts and self-authored connections to Chapters 1–5. It autosaves separately under rivals-workshop.chapter6.v1. Unknown/damaged saves and another tab changing the save pause writes; backup tools let you download the original or archive it before replacement. Draft JSON backups can be restored. Dossier exports are intended for manual sharing; they exclude skipped drafts. Backups contain all retained text.

Schema/content versions are explicit. AI Partner and Team Chemistry consent stays false, including after import. Neither V2 feature is connected. There is no playback, streaming, live AI, skill scoring or automatic analysis of earlier answers. External http/https links open only on click, without opener access or referrer; invalid or credential-bearing links do not open.

Validation: npm test runs the existing chapter checks plus Chapter 6 state/export/security checks; npm run build performs TypeScript checking, Vite build and offline-cache generation.


