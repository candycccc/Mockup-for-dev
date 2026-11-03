# WeQuote Platform CRM

Standalone HTML prototype for the WeQuote CRM deal, quote, revision, variation, change-order, and alternative-group flows.

## File structure

- `index.html` — lightweight page structure and application entry point.
- `assets/css/crm.css` — core WeQuote CRM styles.
- `assets/css/automation.css` — scoped CRM Automation workspace styles.
- `assets/css/compatibility.css` — late-stage visual compatibility rules.
- `assets/js/crm.js` — core CRM data and interactions.
- `assets/js/automation.js` — Automation builder, previews, and Phase 1 data adapters.
- `assets/js/compatibility-pre.js` — pipeline and variation compatibility logic loaded before the existing Quote helpers.
- `assets/js/compatibility-post.js` — Change Order and trainline compatibility logic loaded after the existing Quote helpers.

Keep the complete folder structure together when copying or publishing the prototype; asset paths are relative to `index.html`.

## Run locally

Open `index.html` directly, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

For the existing `1-WeProject-Portal` repository, upload the complete
`wequote-crm-github` folder to the repository root. The page will be available at:

`https://candycccc.github.io/1-WeProject-Portal/wequote-crm-github/`

For a dedicated repository instead:

1. Upload the contents of this folder to the repository root.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch** and select the branch/root folder.

`index.html` is the entry page. No build step is required.
Do not upload the ZIP file as the website itself; extract it first or upload the
prepared folder directly.

## Asset notice

The `fonts/` directory contains locally supplied Font Awesome Pro font files required by some prototype icons. Before publishing this repository publicly, confirm that your Font Awesome licence permits public redistribution. For a public repository, consider keeping the repository private or replacing these files with publicly distributable icon assets.

Google Fonts and Font Awesome Free are also loaded from their public CDNs, so an internet connection is needed for those resources.
