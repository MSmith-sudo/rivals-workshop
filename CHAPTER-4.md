# Trial by Combat

Implemented October 10, 2026. Chapters 1–3 remain available with their original save keys. The original uploaded ZIP was preserved separately.

## What is playable

Six role-neutral authored encounters with 18 decisions: missing flank, unsupported angle, objective versus chase, enemy adaptation, conflicting calls, and overtime. These have shared decision anchors and branching tactical state, with conditional recovery costs and multiple authored endings. They are text simulations, not live game footage or current-patch ability models.

Space, readiness and tempo use a fictional 0–4 scale. A reserve is 0–1. Choices change the next visible situation and final outcome. New encounters explicitly reset resources. Committed choices have stable IDs; presentation order rotates, so selecting the first answer is not a scoring shortcut. One fixed execution variant can produce a loss despite a sound plan. Reload never rerolls it.

Each category has at least four distinct core opportunities across multiple encounters in a fully answered run. Skips are missing observations, not zeros. Category-specific 0/1/2 judgments and primary/secondary weights produce a practice index; free text, self-confidence, and simulated wins cannot increase it. All ten original categories are reused. The coverage threshold and bands are explicitly disclosed and are not validated aptitude or rank measures.

Chapter 3 is copied into a fixed run briefing. Claimed strength, first tension and claimed weakest area (falling back to the first scored weak/unobserved area) determine targeted follow-up questions, in the ten-category order. All players receive the same shared tactical anchors. Personalization does not remove category coverage or change score thresholds. The final debrief compares the two chapters without averaging their unequal evidence samples. No Chapter 7 archetype is assigned.

## Persistence and rehearsal

Chapter 4 uses `rivals-workshop.chapter4.v1`, schema 1, content `combat-1`, rubric `rubric-1`. Draft action, cue and reasoning autosave per run, survive switching and backup import, and restore with pending feedback after reload. Committed histories replay through the local engine; imported scores are ignored. Download combat backup is the importable save format. Download profile & receipts is a readable report, not a backup import format.

Backup import is bounded to 2 MB and merges new run IDs while keeping existing runs; duplicates are skipped, and all-duplicate imports show a notice. Twelve runs fit in a collection. Rehearsing from an earlier decision forks the run, retains the original, preserves its seed/briefing, and excludes inherited decisions from new rehearsal evidence. Starting a fresh rehearsal snapshots current Chapter 3 results. The sidebar can reopen previous runs.

Cross-tab writes pause for an explicit whole-save choice. Keeping this draft archives the other draft before replacing it. Unknown or corrupt Chapter 4 saves are not silently overwritten; download or preserve the original before opening a fresh draft. An incompatible future content version needs the matching app release; the current engine does not reinterpret it. Existing chapter decoders now quarantine unknown/corrupt saves before writing and offer a preserved-original download. Archiving failure prevents overwriting the original.

Use the same origin, including scheme, hostname and port, to reuse browser saves. ZIPs do not carry saves. Blocked storage keeps a memory-only visit and offers a downloaded combat backup. Do not clear browser data without backing up.

## Offline operation

`npm run build` generates `dist/sw.js` and precaches the HTML, hashed JS/CSS, flame and splash artwork. Serve the production build over HTTPS or a trusted localhost origin. After the offline-ready notice, the app can reload while the server is unavailable. Development mode does not register a service worker.

New workers wait for an explicit update from the workshop home; they do not force an active run to reload. Download a backup before updating. Older asset caches remain so already loaded tabs can finish. This release does not automatically prune caches or ship every historical engine. A save from incompatible encounter content is preserved for its matching release rather than rescored.

## Future AI boundary

No AI provider or backend is connected. There are no API keys, automatic uploads, online subscriptions, or automatic queued requests. `combatCoach.ts` provides local coaching. `combatBackend.ts` is an unused optional same-origin transport to `/api/combat/coach`, with an eight-second timeout and a narrow narrative-only response schema. It is not a deployed secure backend.

A future online-coach UI must show the exact selected excerpt and require a player request. Send only request ID/revision, node/action IDs, visible cues, bounded optional rationale, tone and content/rubric versions. Never transmit the full earlier-chapter saves by default. Show local feedback immediately; online failure must not block a trial. Discard stale replies after changing run or revision. Render returned strings as text.

The server must authenticate/authorize, enforce same-origin/CSRF rules appropriate to its auth mechanism, check known node/action/version IDs, cap request/output sizes and cost/rate, keep provider secrets server-side, avoid raw-rationale logging, and implement retention/deletion. Rationale and retrieved text are untrusted data, not instructions. No model tool execution is needed. Never accept transitions, ability grants or score fields from the model. If factual retrieval is later enabled, restrict sources server-side and attach dated patch provenance. The supplied adapter rejects extra score-bearing fields; it does not replace these server controls.

## Validation

Existing Chapter 1/2 state tests and Chapter 3 migration/taxonomy tests pass. Combat tests exhaust 27 branches per encounter (162 total), verify every state remains bounded, resource availability, deterministic replay, full category coverage, skip semantics, duplicate commits, immutable rehearsal, legal import order, dossier isolation and corrupt-save quarantine. Coach tests reject unavailable, timed-out, stale and score-bearing replies.

The browser journey completed all 18 decisions, resumed an unfinished draft after reload, created a rehearsal while preserving the completed first attempt, and verified a cross-tab conflict pause/resolution. Offline reload succeeded with the preview server stopped after cache installation. Chapter 4 debrief checks at 320, 390, 768 and 1440 px found no page-wide overflow or unlabeled form controls, with stage heading focus. These are limited accessibility checks, not WCAG certification or a full screen-reader audit.

The optional real-time timer and an AI coaching server are not enabled. Difficulty escalates through authored tactical constraints; everyone can read at their own pace. Future content expansion can add encounter graphs and equivalent personalized probes without replacing the local engine.

## Review follow-up
See FIXES.md for current changes and fresh verification limits. Older UI-CHECKS.json entries describe the original release checks.
