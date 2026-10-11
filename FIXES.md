# Chapter 4 fixes — October 10, 2026

## Fixed
- Unfinished action, cue and reasoning are preserved per run, through switching, reload and backup import. Legacy schema-1 active drafts migrate without changing score rules.
- Backup merge validates before the React state update, so rejected duplicate-only or over-capacity imports produce an error instead of crashing the render.
- Alternative decisions use the actual pre-decision branch state and its adjusted rubric.
- Rehearsal recommendations use only new evidence, matching the category cards.
- Encounters containing skips receive an incomplete-outcome notice instead of an inferred success.
- Missing/deleted/cleared saves pause writes during a conflict, including empty-string conflict payloads.
- Malformed or future Chapter 3 payloads do not count as a carried briefing.
- Dossier focus includes the claimed weakest discipline; follow-ups name relevant claims, signals and tensions.
- Pending decision feedback persists across reload. Continue acknowledges the feedback.
- Run/backup/coach controls and detailed rubric marks are expandable, reducing mobile clutter.
- Return-to-workshop wording no longer promises a verified save; rules disclose that cue selection is reflection-only and untimed pressure scores measure recognition of urgency.
- Resource-bill feedback now makes independent encounter resets explicit.

## Verification
All existing state, mind and combat tests passed, including all 162 three-action encounter branches. Added test-review.cjs covers draft migration/switch/import isolation, duplicate imports, pending feedback, deleted-save conflict guards, invalid briefing detection, weakest focus, skip endings, adjusted alternative marks and rehearsal evidence. Typecheck and production build passed; offline shell was regenerated.

Fresh browser checks: action/cue/reasoning restored after reload; committed feedback restored after reload; unfinished second-decision reasoning retained after switching to a new run and back; resume button opens the current decision. No browser console errors observed in this journey. At 390 px the checked debrief had no page-wide overflow. This was not an exhaustive mobile, screen-reader, cross-tab or offline-reload audit.

## Remaining design work
The six encounters and scoring rubric remain intact for existing saves. More plausible competing choices, expanded tactical branching, tempo-driven transitions, category validation and a full accessibility audit remain future design work. No live AI is connected. Duplicate run IDs still keep the existing history; differing backup histories are not merged. The twelve-run limit remains.

## Use
Install dependencies with npm ci, then npm test and npm run build. Serve dist with npm run preview (or a static HTTP server). Keep the same scheme, hostname and port to reuse browser progress. Download a combat backup before changing app versions or clearing browser data. The ZIP itself carries no player saves.
