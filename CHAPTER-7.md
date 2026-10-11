# Chapter 7 — The Final Judgment

This is an additive update to the uploaded Chapter 6 app. Homepage art, Chapters 1–6, save keys, chapter styles and existing recovery tools remain. The homepage adds a seventh card and Chapter 6’s dossier links forward to `/#chapter-7`.

## Run

Use Node.js 22.12+ (tested on Node 24.18). Extract the ZIP, open a terminal in `rivals-workshop`, and run:

```sh
npm ci
npm run dev
```

Open the URL Vite prints, then Chapter 7. To retain your existing saves, use the **same browser, hostname and port** as your Chapter 6 app. If your old server is occupying that port, stop it before starting this version. Vite otherwise selects a different port, whose browser storage is separate. No browser saves are bundled in this ZIP.

For a production build:

```sh
npm test
npm run build
npm run preview
```

The included `dist` is already built. Serve it over HTTP; do not double-click `index.html`. Internet is needed for dependency installation. Chapter 7 scoring runs without network access. The existing production service worker caches the app shell after its offline-ready notice. Development mode needs the local server.

## Result and evidence

The reveal supports reduced motion and has a replay control. The dossier contains primary and secondary identity, contradiction or contextual tradeoff, included hero and court answers, ten game-sense comparisons, social strengths and friction, soundtrack, a personal contribution award and a concrete growth challenge. Original writing is displayed as text, never HTML.

Twelve archetypes include The Kill-Seeker, The Stalwart Savior, The False Hope and The Unsung Lord. The full roster, exact weights, signal paths, rule version, scores, tie order and margin are visible under The evidence. They are playful hypotheses, not diagnoses, rank estimates or population comparisons.

Features come only from explicit Chapter 1/5 choices or sufficiently sampled Chapter 4 rubric evidence. Chapter 2 writing and Chapter 6 music enrich the dossier without scoring. Each feature caps at 1; adding more heroes cannot multiply it. Three recorded signals from at least two source chapters are required for any identity. Highest weighted sum wins, with roster order resolving ties. No randomization, free-text keyword scoring, writing-length scoring or external AI is used.

Chapter 4 uses the earliest saved `first` run. Rehearsals and their newly answered decisions are listed separately; copied history never inflates the baseline. Per-discipline comparisons require at least three marks spanning two encounters. Marks score decisions using the existing authored rubric, independently of fictional outcomes. Draft/uncommitted decisions never count.

Claim gaps require an included Chapter 3 claimed strength and sufficiently sampled Chapter 4 evidence below 75/100. A claimed weakest category with evidence at or above 75 is shown as a contrary signal. Confidence, remembered match accounts and mastery are self-reports. No matches have been observed or verified.

## Saves, skips and privacy

Chapter 7 reads the six existing keys through their actual decoders. It never writes or replaces them, and does not create a new answer save. The existing app’s last-route key can remember Chapter 7. Refresh, tab focus and storage events update the portrait. Editing uses links to the existing chapters and their saved stages.

Skipped retained drafts are excluded from sources, scoring and export. Empty and limited evidence remains unknown. Corrupt and unsupported schemas are excluded with a warning; their original strings remain untouched. The Chapter 2 demo is excluded. Chapter-specific count units and limitations are explained on screen.

Downloads are manual JSON exports. Nickname and written answers start excluded. The exact payload is previewable before download. Optional included answers carry detailed source records, scenario receipts and soundtrack information; skipped drafts stay excluded. No public link, upload or automatic sharing is performed.

`PartnerProfileV2` in `src/judgmentState.ts` reserves a versioned individual schema for future team chemistry and AI partner consumers: identity IDs, rules version, evidence origin, baseline ID, coverage, communication tendencies, growth challenge and extension fields. Consent and capability flags stay disabled. A downloadable profile does not grant any future permission or connect a service.

## Verification

`npm test` runs every original suite and the new judgment suite. New checks cover deterministic repeatability, all 12 reachable archetypes, missing/corrupt/future saves, skipped text exclusion, court demo exclusion, first-attempt/rehearsal isolation, free-text/music score invariance and private export/V2 consent defaults.

Browser verification covered reveal/replay, empty-evidence fallback, dossier rendering, homepage chapter links, unchecked export options, semantic table and heading focus, desktop and 390px responsive views, contained horizontal scrolling for the comparison table, and no browser warning/error logs. Reduced-motion behavior is implemented in CSS; a full assistive-technology audit was not performed.
