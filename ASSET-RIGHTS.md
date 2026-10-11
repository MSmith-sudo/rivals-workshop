# Artwork and media

The original geometric role artwork remains available as fallback artwork. V2.5 displays the supplied splash image and local official character portraits; see the V2.5 provenance notes below. Artwork ownership remains with its respective creators.

## Add portraits you have permission to use
Place artwork under public/media, then edit src/hero-media.json using an exact hero ID from src/heroes.official.json:

```json
{
  "your-hero-id": {
    "src": "./media/your-portrait.webp",
    "alt": "Describe the portrait",
    "credit": "Artist / source",
    "rights": "Your permission or license basis"
  }
}
```

Use local PNG, JPG, WebP or SVG paths with letters, numbers, underscores, hyphens and subdirectories. Remote URLs, path traversal, empty attribution and missing permission notes are rejected. Keep license/permission documents with your assets. SVG files should be trusted static artwork. Broken portraits fall back to original role artwork and initials. Permission notes are a configuration record, not an automatic license verification. Rebuild after changing artwork. Existing music thumbnails retain their original supported provider allowlist and explicit metadata-fetch consent.

## V2.4 character portrait library
Browser uploads accept PNG, JPEG and WebP only; they are decoded and re-encoded into local raster data. The uploader does not fetch remote assets. Upload only artwork you have permission to use. Images are a separate local presentation setting, not part of existing profile exports. Default chapter scenes remain original vector artwork. Hero colors reference character visual motifs; they do not imply official affiliation.

## V2.5 mobile artwork

The supplied rivals-splash.png is now displayed on the homepage at the user’s request. All 54 roster IDs have local WebP character portraits derived from the official promotional hero-card images at https://www.marvelrivals.com/heroes/, retrieved October 10, 2026. Exact image source URLs and ownership notes are recorded per entry in src/hero-media.json. These are Marvel / NetEase assets, not original project artwork, public-domain assets, or a newly granted license. Original role mascots remain fallback art, and browser custom uploads take precedence. The application makes no remote artwork requests during play.
