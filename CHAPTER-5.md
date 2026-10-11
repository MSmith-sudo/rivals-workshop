# Chapter 5 — The Friend or the Menace

This release continues the exact uploaded rivals-workshop-chapter-4-fixed.zip. Chapters 1–4 and their storage keys are retained. The homepage gains Chapter 5, Continue Assessment recognizes it, and the Chapter 4 debrief links to it.

## Run

Install Node.js 20.19+ or 22.12+ (Node 24 also works). Extract the ZIP, open a terminal in rivals-workshop, then:

    npm ci
    npm run dev

Open the local URL printed by the server. Choose Chapter 5 on the homepage or append #chapter-5. Production: npm run build then npm run preview. The ZIP includes the built dist folder; serve it over HTTP, rather than opening index.html directly. Existing setup and offline instructions remain included.

## Keep your saves

Browser saves belong to the browser and exact origin (scheme, host and port). To retain Chapters 1–4, use the same browser and URL/port as the previous release. Replacing source files does not move or clear saves. Download existing chapter backups before changing browsers or ports. Apply an offered offline update from the homepage after backing up.

Chapter 5 uses rivals-workshop.chapter5.v1 exclusively. It saves stage, choices, optional examples, skips, context and completion. Back/Next and stage navigation retain drafts. Skip scenario/stage retains draft answers but excludes them from evidence until restored or reselected. Progress counts answered or skipped scenarios; the answered count is separate. Blank answers never imply traits. The mirror is available with partial evidence, and completing the reflection never locks editing.

Backups & restore downloads the current draft or stored original. Import replaces the Chapter 5 draft and archives the stored copy under rivals-workshop.chapter5.v1.recovery. Download the in-memory draft first if needed. Recovery retains one archived copy, not an unlimited history. Invalid/future saves pause autosaving; other-tab changes also pause it until a draft is chosen. Storage failure keeps the visit usable in memory and asks for a backup.

## Assessment design and Version 2 boundary

Five stages; ten authored scenarios; thirty choices. Each domain has one hypothetical response, with a provisional tendency, potential strength, possible friction and context check. These are authored interpretations of choices, not validated psychological measurements or observed match behavior. Optional text is displayed verbatim as unverified evidence, never scored or sent to AI. No overall goodness score, ranking, team comparison or fixed personality label.

socialState.ts provides typed Scenario, Choice, Trait, Response, SocialSave and SharingConsent structures with stable scenario/choice identifiers and a content version. A future shared-profile flow must introduce explicit opt-in consent and a separate export/transport boundary; Version 1 types permit only false and decoding forces both consent fields off. No live Team Chemistry, sharing or AI partner is implemented. Manual JSON downloads contain optional examples and should be handled privately.

## Checks

    npm run typecheck
    npm test
    npm run build

All passed for this delivery. Existing Chapter 1–4 regression suites pass, plus Chapter 5 coverage, serialization, retained skipped choices, missing/invalid evidence, unscored text, bounded imports, future/corrupt save rejection and consent-off checks. Browser smoke checks confirmed selection feedback and draft restoration after reload; desktop and 390px mobile layouts were inspected. This is not a full assistive-technology audit. Chapter 5 uses labeled native radio groups, accessible progress, focus on stage changes, visible keyboard focus, 44px minimum button heights and the existing responsive chapter styling.
