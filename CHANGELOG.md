# V2.2 changes

- Kept the existing seven chapters, vault migration/recovery, chemistry and Gemini provider integration.
- Made companion conversation warmer and more fluid; added Hang out and Brainstorm modes. Removed compulsory analysis/practice templates and allowed citation-free general conversation while retaining receipt checks for cited claims.
- Added opt-in writing assistance inside Chapter 1–6 free-text fields, with field-specific requests, before/after comparison, explicit Apply/Discard/Undo, character limits and protection against stale responses.
- Added personalized archetype, secondary, social and team title generation, editable names, explanations, stored evidence provenance, stable offline fallbacks and export support. Creative labels never feed assessment scores.
- Added real YouTube oEmbed metadata and thumbnail cards for entrance/battle/outro. Preserved entered song credits, profile snapshots and dossier exports. Added consent, safe links, fixed endpoint validation, redirect blocking, response limits and unavailable-image/metadata fallbacks. No automatic playback.
- Added regression tests and mobile/desktop browser checks. Build and full automated suite pass. Provider AI tests use mocks; real YouTube metadata was checked with a public video.

Start with [V2.2-SETUP.md](V2.2-SETUP.md). Detailed verification is in [V2.2-QA.md](V2.2-QA.md).

---

# Chapter 4 — Trial by Combat

- Added six encounters, eighteen committed decisions, branching state/costs and multiple authored endings.
- Added category-specific scoring, coverage limits, transparent receipts and preserved rehearsal forks.
- Added Chapter 3 snapshot handoff, JSON combat backups and validated merge import.
- Added cross-tab conflict handling, unreadable-save recovery and production offline caching.
- Fixed Chapter 3 strength slot ordering, reply-only interrogation access, skip clearing and all-observed growth challenge.
- Updated Chapter 4 naming, homepage resume behavior and Chapter 2 current-step semantics.
- Preserved original chapter save keys and legacy Chapter 3 migration. No AI backend is connected.
- See CHAPTER-4.md for validation and implementation limits.

# Rivals Workshop — Chapter 3 polish

- Restored exactly ten disciplines: Analytical, Reactive, Proactive, Fight Awareness, Positioning Awareness, Resource/Cooldown Awareness, Objective/Macro, Adaptability/Flex, Team Awareness, Pressure Decision-Making.
- Engagement Timing, Target Priority, Risk Assessment and Composure are supporting subskills. Ten scenarios still cover ten disciplines; proactive and analytical dilemmas now directly test preparation and competing explanations.
- Preserved all six stages, navigation, artwork and established styling. Improved dark select controls and narrow-screen archive wrapping.
- Offline Interrogation pairs each discipline with a likely overlapping neighbor, asks for distinguishing evidence and responds to missing account structure. English wording cues are explicitly heuristics and never increase a skill score.
- Diagnosis includes an evocative provisional identity, scenario-linked strengths, optional self-reported receipts, low-confidence uncertainty, claim/scenario conflicts and a three-fight growth experiment. Final archetypes remain reserved for Chapter 7.
- Kept the Chapter 3 localStorage key. Schema version 2 archives the entire version 1 payload. Directly matching claims/drafts and five unchanged scenario responses are retained. Broad awareness and removed subskill claims are not relabeled. Five changed scenario responses are archived, not scored. Rationales, stage, confidence and skipped markers survive. Completion must be reconfirmed. Migration is idempotent; the archive remains in exports.
- Chapter 1, Chapter 2, homepage, hero data, global styles and save keys are byte-for-byte unchanged.
- Expanded state tests for taxonomy, migration, round trips, invalid data, no invented strengths and distinct follow-ups. Added explicit typecheck command.

## Validation on October 10, 2026

Clean npm ci succeeded with the supplied lockfile (69 packages, audit reported zero vulnerabilities). npm test, npm run typecheck and npm run build passed. The ZIP contains the fresh production build.

Headless Microsoft Edge checked homepage and Chapters 1–3 at 320, 390, 768 and 1440 pixel widths. All six Chapter 3 stages passed no-page-overflow and labeled-control checks. Verified stage heading focus, keyboard focus availability, reload persistence, Chapter 1/2 save isolation, legacy migration, blocked-storage notice and no page runtime errors. Mobile diagnosis was visually inspected.

Accessibility checks are limited to labels, image alternatives, main landmarks, focus and responsive layout; a full screen-reader audit or WCAG certification was not performed. Match accounts are unverified; authored choices are practice signals, not a validated player assessment. Chapter 4 and Chapter 7 remain unimplemented.
