# WeQuote CRM Automation - Mainline PRD Handoff

Prepared for product, CTO and developer review on 23 August 2026.

## Start here

1. Read `PRD/WeQuote-CRM-Automation-Roadmap-Phase-1-to-Phase-3.pdf`.
2. Open the matching visual sources under `artifacts/` when implementation detail is needed.
3. Open `prototype/index.html` to use the current Phase 1 interactive prototype.

## Scope hierarchy

- Phase 1: fixed Quote lifecycle and Automation inside protected Stages.
- Phase 2: customer-defined Stages inserted between protected Quote lifecycle Stages.
- Phase 3: Fully Custom Pipeline with one shared Automation block library.

The 38-page PDF is the presentation and decision summary. The HTML artifacts are supporting implementation references. The interactive prototype demonstrates current Phase 1 behaviour and is not a production system.

## Clean-gate rules used for this handoff

Included:

- latest 38-page mainline PRD;
- canonical Phase 1, Phase 2 and Phase 3 artifacts;
- supporting earlier flows that still explain the agreed interaction model;
- clean, directly openable Phase 1 prototype runtime.

Excluded:

- `before-*` snapshots and backup HTML;
- cropped composites, browser comment-marker screenshots and Section badge captures;
- temporary renders, PDF generator sources and superseded working documents.

## Important implementation boundary

Quote lifecycle events remain the trusted source of protected Stage progression. Customer Automations may react to events and update CRM work, but must not redefine protected Quote lifecycle outcomes.

## Hosting note

The prototype uses local Font Awesome Pro font files and remote CDN resources. Confirm the font licence before publishing this package in a public repository. A private repository is recommended for internal review.
