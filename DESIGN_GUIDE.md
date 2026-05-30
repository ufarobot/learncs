# learncs.ru Design Guide

Reference: OpenAI public site visual system, adapted for learncs.ru rather than copied. For brand positioning, color roles, contrast, and marketing fit, follow `BRANDBOOK.md`. For shared component behavior and variants, follow `COMPONENTS.md`.

## Direction

The site should feel calm, spacious, editorial, and image-led:

- white main background with soft green-tinted surfaces only for selected sections, cards, and summary blocks;
- one strong action color: learncs blue for CTA buttons;
- non-action accent backgrounds use a soft green scale; beige stays mainly for separators and practical text accents;
- generous vertical rhythm and wide page gutters;
- simple typography with large page titles and compact interface text;
- rounded cards, only restrained tokenized shadows, no decorative gradients;
- image-first cards where photos/screenshots carry the visual weight;
- CTA buttons keep the legacy learncs blue color and rounded rectangle shape;
- section backgrounds as full-width bands, not nested floating panels.

## Layout Tokens

- Desktop container: about 1200px with 32px side gutters.
- Mobile gutters: 14px.
- Section padding: 96-112px desktop, 58-64px mobile.
- Connected section padding: 42px desktop, 36px mobile on each side; use only for neighboring blocks that continue one narrative group.
- Card gaps: 12-18px inside dense grids, 24-48px between major blocks.
- Card padding: 24-32px desktop, 20px mobile.
- Border radius: 16px for normal cards, 24px for large hero/summary blocks.

## Responsive Contract

Responsive behavior is part of every landing block. Do not treat mobile as a separate cleanup pass.

- Prefer the existing homepage responsive patterns before inventing new ones.
- Use the same tested breakpoints unless a new layout has a clear reason: desktop, medium/tablet around 1120px and 1000px, mobile around 760px.
- On mobile, repeated cards and `split-media` sections collapse to one readable column with normal page gutters.
- Never leave a desktop side column active on mobile if it makes body text or headings break into word-per-line columns.
- Avoid horizontal overflow, clipped text, and hidden content on mobile.
- Keep media capped with explicit max-widths; a wider or narrower layout must not upscale photos unexpectedly.
- Prefer standard mobile patterns already used in the upper homepage blocks: single-column facts, centered compact hero media, full-width text cards, and `split-media` content stacked with copy first unless the component explicitly defines another order.

## Components

Buttons:

- Primary CTA: learncs blue background, white text.
- Secondary CTA: off-white background, black text.
- Minimum height around 56px on desktop and full width on narrow screens.

Accent color:

- Keep `--blue` and `--blue-dark` for CTA buttons, functional links, and active states.
- Use `--muted` for subheadings, meta, captions, helper text, and secondary copy.
- Use `--accent`, `--accent-dark`, `--accent-soft`, and `--accent-line` for thin dividers, secondary facts, compact chips, secondary hover states, and selected soft section bands.
- Use `--accent-strong` only for short non-clickable practical conditions inside cards, where the condition needs emphasis without looking like a link or CTA.
- Do not use soft green as a generic background for arbitrary blocks.
- Keep large section headings, card headings, hero fact headings, main fact copy, and price numbers in `--ink` or the approved body-copy tokens.
- Keep the hero pretitle as quiet text; it must not look like a technical tag.
- Do not use blue for decorative dividers, pills, or informational emphasis unless the element is a primary action.

Cards:

- Use quiet `--card-bg` or white `--surface`; avoid mid-gray panels.
- Avoid borders unless a separator is genuinely needed.
- Use `--shadow-soft` only for registered white card groups where it improves scanability on the white page canvas.
- Put media at the top of content cards when an image exists.

Images:

- Prefer real screenshots/photos over illustration-like blobs.
- Do not crop photos by default; prefer full image display with `object-fit: contain` or natural height.
- Every landing image must have an explicit template max-width; do not rely on `width: 100%` alone because layout changes can upscale photos.
- Do not blur, darken, or rectangularly clip the hero student image.
- On mobile, keep the hero student image as a compact centered illustration below the CTA: about 74-78vw wide, capped near 270-300px.
- On tablet/medium screens, scale the hero title and image down before switching to mobile layout; never let hero headings break inside words.

Typography:

- Keep letter spacing at 0.
- Large H1 only for page heroes.
- Card headings stay compact; do not use hero-scale text inside cards.

## Implementation Notes

The current implementation separates landing content from layout templates. Page content lives in Markdown frontmatter as `blocks[]`; Astro chooses approved layout templates through `BlockRenderer.astro`; shared visual rules live in `assets/styles.css`.

## Architecture Contract

Use the site as a small landing design system, not as a collection of one-off pages.

Layer order:

- `tokens`: colors, radii, spacing, typography scale, container widths;
- `base`: body, links, headings, images, lists, shared layout primitives;
- `components`: buttons, cards, media blocks, facts, lists, FAQ, final CTA;
- `page recipes`: approved section sequences for page types;
- `exceptions`: page-specific layout only, never a new visual language.

New visual work should start from `COMPONENTS.md` and the existing layout-template vocabulary. Add a new template only when existing templates cannot express the layout without awkward markup.

Component consistency:

- one visual role must have one component class;
- do not use one class for two different visual roles;
- do not make identical or similar components look different across pages unless a named variant is documented in `COMPONENTS.md`;
- if a page needs a different look, promote it into a shared component or registered variant before styling the page;
- content topics must not create new CSS families; use layout template names instead.

## Block Vocabulary

Approved layout templates:

- `hero-split`: first-screen headline, lead, actions, optional media, and short fact cards;
- `split-media`: media on one side, copy on the other, optional detail cards and proof line;
- `card-grid`: repeated cards with text or lists;
- `media-stack`: copy plus one or more images/screenshots, optional support cards and metrics;
- `image-showcase`: heading plus one large image or screenshot;
- `two-column-list`: two or more list panels in a responsive grid;
- `centered-summary`: compact centered statement, price, terms, or key condition;
- `logo-grid`: centered grid of logos without card frames;
- `faq-accordion`: question and answer list;
- `cta-panel`: closing action panel.

Avoid new page-prefixed or topic-prefixed visual systems such as fresh `camp-*`, `teacher-*`, or course-name CSS families. New subject matter should be expressed by existing templates.

## Page Recipes

Main course page:

1. `hero-split`
2. `split-media` or `card-grid` for proof and context
3. `card-grid` for format, benefits, or path
4. `media-stack` for platform/materials
5. `card-grid` for curriculum or modules
6. `image-showcase` or `two-column-list` for proof and fit
7. `centered-summary`
8. `faq-accordion`
9. optional `logo-grid` for concrete outcomes or institutions
10. `cta-panel`

Utility page:

1. compact `hero-split`
2. one task-focused layout template
3. `cta-panel` when there is a next action

## Change Workflow

Before adding or redesigning a landing block:

1. Check `BRANDBOOK.md` for color role and brand fit.
2. Check `COMPONENTS.md` for an existing component or approved variant.
3. Check the approved `blocks[]` templates before adding any component or CSS.
4. Check the mobile behavior for the chosen template at the same time as the desktop composition.
5. If the request or proposed implementation conflicts with the brandbook/design guide/component registry, state the conflict and propose the closest compliant alternative before editing.
6. Use the approved layout-template vocabulary and page recipe.
7. Keep new CSS inside the architecture layers.

Experiment mode:

- Use this for trial copy, trial layout, color comparisons, and small visual adjustments.
- Keep edits narrow and reversible.
- Do not update the component registry, run `check-design`, build, publish, or browser validation unless explicitly requested.

Production mode:

- Use this when the user says "фиксируем", "вноси", "делаем", "в прод", or asks for deploy.
- Reconcile the change with `BRANDBOOK.md`, this guide, and `COMPONENTS.md`.
- Run `npm run check:prod`.
- Do not automatically probe the already-running `8123` dev server; use `npm run check:preview` only when server availability itself is being debugged.
