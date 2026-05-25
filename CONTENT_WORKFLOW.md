# Homepage Content Workflow

This file documents the editing layer for the learncs.ru Astro landing.

## Source Of Truth

- Homepage content lives in `src/content/pages/home.md`.
- Homepage structure and visual rules live in Astro components, `BRANDBOOK.md`, `DESIGN_GUIDE.md`, and `COMPONENTS.md`.
- Do not reintroduce page content in `src/data/home.js` or component files.

## WebStorm Workflow

Use WebStorm as the content and code editor:

1. Open `src/content/pages/home.md`.
2. Edit the YAML frontmatter for real homepage content.
3. Use Markdown preview only for editor notes and long prose readability.
4. Check the real page in Astro preview at `http://127.0.0.1:8123/`.
5. Run `npm run build`, `npm run publish:local`, and `npm run check:design` before treating a change as ready.

WebStorm helps here because it supports Astro files, Markdown live preview, and YAML editing. The final design preview is still Astro, not Markdown, because landing blocks are component-based.

## Editing Rules

- Change text, facts, FAQ, program items, schedule, and price in `home.md`.
- Keep section order aligned with the page recipe in `DESIGN_GUIDE.md`.
- Keep color roles and component variants aligned with `BRANDBOOK.md` and `COMPONENTS.md`.
- If a change needs a new visual pattern, register it in `COMPONENTS.md` before styling it.
- If a proposed text or layout conflicts with the design system, say the conflict first and propose the closest compliant alternative.

## Current Recommendation

Use this workflow before adding a heavier CMS:

- WebStorm for editing structured Markdown/YAML content.
- Astro content collection schema in `src/content.config.ts` for build-time validation.
- Local Astro preview for actual visual review.
- Decap CMS or another admin UI only if editing in WebStorm is still too slow after this layer settles.
