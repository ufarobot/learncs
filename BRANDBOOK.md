# learncs.ru Brandbook

This brandbook is the source of truth for visual identity decisions. `DESIGN_GUIDE.md` defines layout rules, `COMPONENTS.md` defines shared components and variants, and this file defines brand meaning, color roles, contrast, and marketing fit.

Reference systems used for direction, not copying: WCAG 2.2 contrast requirements, IBM Carbon role-based color tokens, IBM Design Language's blue-core logic, and Material Design's separation of primary/action color from secondary accents.

## Brand Positioning

learncs.ru is an online course in olympiad informatics for school students and their parents.

The brand should feel:

- rigorous, technical, and trustworthy;
- calm enough for parents evaluating education quality;
- warm enough to avoid a cold enterprise/SaaS feeling;
- precise and focused, not playful, childish, or decorative.

The visual language should not look like:

- a generic kids school landing with bright primary colors;
- a craft/retro beige brand;
- a heavy developer documentation site;
- a SaaS dashboard with too many gray cards and borders.

## Color Roles

Color is assigned by role, not by taste. A color value can be changed only if its role stays clear and contrast remains valid.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Page background | `--bg` | `#ffffff` | Main page canvas. |
| Soft section | `--accent-bg` | `#f2f7f3` | Selected soft section bands and final CTA area, not the default section fill. |
| Soft card | `--card-bg` | `#f2f7f3` | Cards and soft summary blocks when a surface needs a quiet accent. |
| Primary action | `--blue` | `#155d96` | CTA buttons, functional links, and active UI states. |
| Primary action hover | `--blue-dark` | `#0f426b` | CTA hover/focus and high-emphasis active states. |
| Main text | `--ink` | `#111111` | Headings, hero facts, card headings, prices, key claims. |
| Body text | `--graphite` | `#1f2933` | Paragraph text and main descriptive copy. |
| Secondary text | `--muted` | `#526170` | Subheadings, meta, captions, and secondary text. |
| Hero pretitle | `--pretitle` | `#526071` | Quiet pretitle above the hero headline. No pill by default. |
| Soft accent fill | `--accent-soft` | `#f2f7f3` | Compact accent chips and secondary hover states only, not section headings. |
| Accent text | `--accent-dark` | `#6f604d` | Text inside secondary facts on soft accent surfaces. |
| Strong warm accent | `--accent-strong` | `#806044` | Short non-clickable emphasis lines for practical conditions inside cards. |
| Accent line | `--accent-line` | `#eee2d0` | Subtle beige separators and compact chip borders. |
| Neutral line | `--line` | `#e8dccb` | Low-emphasis separators where layout needs structure. |
| Soft line | `--line-soft` | `#f0e8dc` | The lightest section and card separators. |

Depth:

- `--shadow-soft` is a restrained elevation shadow for white cards on white backgrounds when spacing and borders alone do not separate repeated items enough.
- Use `--shadow-soft` only for registered card components, not for decorative emphasis, hover effects, media frames, or nested card stacks.

## Contrast

Minimum target for normal text is WCAG AA: 4.5:1. Large decorative shapes and separators can be lower because they do not carry text meaning.

| Pair | Ratio | Status |
| --- | ---: | --- |
| `--ink` on `--bg` | 18.88:1 | Strong |
| `--graphite` on `--bg` | 14.76:1 | Strong |
| `--muted` on `--bg` | 6.36:1 | Pass |
| `--pretitle` on `--bg` | 6.42:1 | Pass |
| `--blue` on `--bg` | 6.91:1 | Pass |
| white text on `--blue` | 6.91:1 | Pass |
| `--accent-dark` on `--accent-soft` | 5.61:1 | Pass |
| `--accent-strong` on `--bg` | 5.72:1 | Pass |
| `--accent-strong` on `--card-bg` | 5.27:1 | Pass |
| `--muted` on `--card-bg` | 5.87:1 | Pass |
| `--accent` on `--accent-soft` | 1.98:1 | Decoration only |
| `--ink` on `--accent-bg` | 17.42:1 | Strong |

Rule: `--accent` is not a text color for normal UI text. Use it for fine lines, subtle markers, or non-essential decorative emphasis. Use `--accent-dark` when accent text is needed. Use `--accent-strong` only for short non-clickable practical conditions where `--accent-dark` is too muted.

## Usage Rules

Blue:

- Use for primary CTA buttons, links, and active states.
- Do not use for decorative dividers, card outlines, or non-clickable emphasis.
- Keep the CTA visually dominant; do not create competing blue chips around it.

Black and graphite:

- Use `--ink` for H1/H2/H3, hero facts, module titles, and price numbers.
- Use `--graphite` for main prose.
- Do not make large semantic headings brown or beige.

Muted text:

- Use `--muted` for subheadings, meta, captions, helper text, and secondary copy.
- Reach for `--muted` before using brown/beige for neutral text.
- Do not use `--muted` for H1/H2/H3, price numbers, or primary CTAs.

Soft green and beige:

- Use soft green for selected section bands, card accents, compact chips, and secondary hover states.
- Use beige mainly for thin separators and quiet practical text accents.
- Use sparingly in text; it should support hierarchy, not become the brand's main voice.
- Use `--accent-strong` for one-line practical conditions inside cards, such as payment terms; do not use it for links, headings, CTAs, or long paragraphs.
- Implement this role as `.text-accent-practical` or the matching content field for practical emphasis; do not target a specific card position or a specific phrase.
- Do not treat soft green as a generic soft background for every block.
- Avoid a "craft" or "retro" feeling by keeping the main type black and the action color blue.

Hero:

- Hero pretitle is quiet text in `--pretitle`; no border and no filled technical tag by default.
- Programming languages in the hero use `--ink`: they are a content signal, not a functional action.
- Student image stays as a transparent illustration/media object, not a cropped rectangular photo card.

Cards and sections:

- Cards should not depend on visible borders for structure when spacing and headings already separate content.
- Soft elevation is allowed through `--shadow-soft` when white cards sit on the white page canvas and need better scanability.
- Soft green surfaces are allowed for selected section bands, especially where they connect visual blocks or reduce long-page fatigue.
- Avoid gray-on-gray stacks; they make the course feel generic and less premium.

External logos:

- External institution and partner logos may keep their original brand colors inside the registered `logo-grid` component.
- Do not reuse colors from external logos as learncs accent colors, text colors, buttons, dividers, or card styling.

## Marketing Fit

Audience:

- Parents need trust, clarity, and a sense of serious instruction.
- Students need a signal that the course is technical, modern, and connected to programming.
- The page should communicate "structured olympiad informatics" rather than "general tutoring".

Color strategy:

- Blue carries competence, technology, and action.
- Soft green prevents the page from feeling cold or bureaucratic without pulling the site into beige craft styling.
- Black preserves rigor and premium clarity.

Conversion strategy:

- Keep the primary CTA blue and visually isolated from decorative accents.
- Use soft accent backgrounds to make long-form information less tiring.
- Keep meta quiet so the headline and CTA remain the first read.

## Do Not

- Do not introduce new saturated colors without adding a token, role, contrast check, and brandbook note.
- Do not make card headings, general hero fact copy, or price numbers brown.
- Do not use beige fills that look like marker highlights.
- Do not use blue as a decorative line or frame.
- Do not add heavy or decorative shadows, gradients, or nested cards to create hierarchy.
- Do not let image treatment become a new visual family; use the approved media-object rules.

## Implementation Contract

- All colors must come from tokens in `assets/styles.css`, except documented one-off values such as `--pretitle` if they are promoted into tokens immediately.
- Any new color must be added to `EXPECTED_TOKENS` or `ALLOWED_HEX` in `tools/check-design.py`.
- Normal text pairs must pass 4.5:1 contrast and be listed in the automated contrast checks when they become reusable roles.
- Every visual change must be checked against this brandbook, `DESIGN_GUIDE.md`, and `COMPONENTS.md` before implementation.
- If a requested or proposed change conflicts with the brandbook/design guide/component registry, the conflict must be stated explicitly and a compliant alternative must be proposed before editing.
- Homepage source and generated root page must not show patterns that contradict approved homepage components.
Experiment mode:

- Keep edits narrow and reversible.
- Do not run `check-design`, build, publish, or browser validation unless explicitly requested.

Production mode:

- When fixing a change for production, run `npm run check:prod`; it includes the design check and Astro build. The user reviews the already-running `8123` dev preview manually unless a shell-level preview check is explicitly requested.
