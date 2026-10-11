# Chapter 6 implementation notes

Entrance Theme, Battle Theme, Outro Theme, Behind the Music, Musical Identity dossier are individually editable and optional. Skipping retains local drafts; dossier exports omit skipped text and track metadata. A blank title or source is clearly marked as a draft. Mood tags are descriptive, never scored. Connections to earlier chapters are authored by the player, not inferred by a model.

Local schema: musicState.ts exports MusicSave version 1, contentVersion soundtrack-1. Its storage key is isolated from Chapters 1–5. Backup import validates the envelope, bounds stage/text/tags and forces future consent off. Unknown schema/content versions are refused without overwriting. Concurrent stored changes pause writes; choosing this draft archives the original under a timestamped recovery key. Download originals/backups before resolving conflicts. Backups restore only Chapter 6, while musical-identity exports are sharing artifacts rather than restore files.

The structured individual dossier has explicit theme roles, recorded/draft/skipped status, self-authored commentary, interpretation limits and disabled futureIntegration fields. No V2 transport is implemented. A future integration must obtain explicit informed consent before sharing; export alone is not consent.

External URLs use URL parsing and an http/https allowlist, reject embedded credentials, never load automatically and use noopener/noreferrer/no-referrer. React renders user text literally. There is no audio embed, licensed playback, streaming claim or live AI.

Verification: all existing tests plus test-music.cjs pass. Production build includes TypeScript checking and offline shell generation. Setup instructions are in SETUP.md. Existing chapter source changes are limited to Chapter 5's forward link; homepage changes add Chapter 6 and update chapter counts/navigation. Existing storage schemas/keys remain unchanged.
