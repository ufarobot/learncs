# learncs.ru Component Registry

This registry prevents "CSS zoo" drift. A component is a reusable visual role with one default appearance. A new variant is allowed only when it is named here and has a documented reason.

## Rule

- Do not use one class for two visual roles.
- Do not change a component on one page with page-specific selectors unless the variant is registered here first.
- If a requested page-level change would make a shared component look different, either update the shared component everywhere or create a named variant.
- Components used on the homepage or apply page must keep the approved styling from `assets/styles.css`.
- Landing blocks are selected by layout template, not by content topic. Do not create `teacher-*`, `camp-*`, `student-*`, or course-name CSS families for ordinary landing content.

## Layout Templates

Landing pages are assembled from `blocks[]` in Markdown frontmatter. `template` names describe composition only.

Approved templates:

- `hero-split` — first-screen headline, lead, actions, optional media, and short fact cards.
- `split-media` — media on one side, copy on the other, optional detail cards and proof line.
- `card-grid` — repeated cards with text or lists.
- `media-stack` — copy plus one or more images/screenshots, optional support cards and metrics.
- `image-showcase` — heading plus one large image or screenshot.
- `two-column-list` — two or more list panels in a responsive grid.
- `centered-summary` — compact centered statement, price, terms, or key condition.
- `faq-accordion` — question and answer list.
- `cta-panel` — closing action panel.

Allowed template controls:

- `surface`: `white` or `muted`.
- `columns`: `2`, `3`, or `4` where the template supports grids.
- `cardStyle`: `plain` or `module`.
- `wideLast`: boolean for grid layouts that need the final card to span the row.
- `spacing`: `tight-top` for sections that should visually continue the previous block without default section spacing.

New templates are allowed only for a new layout composition. New subject matter should use an existing template.

## Text Labels

### `pretitle`

Use for quiet text above a hero headline.

Default:

- `color: var(--pretitle)`
- no background
- no border
- no padding
- no pill styling

Use in:

- homepage hero;
- future product/course hero sections where the line is descriptive, not a category chip.

Do not use:

- for section labels;
- as a badge;
- with beige fill or border.

### `eyebrow`

Use for section labels inside content sections.

Default:

- small pill/chip;
- `color: var(--accent-dark)`
- `background: var(--accent-soft)`
- `border: 1px solid var(--accent-line)`

Use in:

- section intros;
- compact category labels;
- internal documentation section headings.

Do not use:

- in hero pretitle;
- for clickable states.
- for neutral meta or secondary copy; use `--muted` text without a badge instead.

## Actions

### `button-primary`

Use for the primary conversion action. It must stay learncs blue.

### `button-secondary` / `button-quiet`

Use for secondary navigation or lower-emphasis actions. They must not compete with the primary CTA.

## Media

### `hero-visual`

Use for the hero student illustration/media object.

Default:

- transparent background;
- no border;
- no rectangular crop;
- image uses `width: auto`, `height: auto`, `max-width`, `max-height: none`, `object-fit: contain`.

All media templates must define a max-width for images. Images must not depend on `width: 100%` alone, because a wider layout column can otherwise upscale a photo.

## Cards

Cards are for repeated items or genuinely framed tools. Page sections should not become nested card stacks.

Approved card roles:

- summary card;
- content card;
- support card;
- payment card;
- FAQ item.

### `hero-facts-card`

Use for the homepage hero fact strip when the facts combine product value and practical conditions and need more scanning space than an unframed strip.

Allowed pages:

- homepage.

Default:

- three separate cards on desktop;
- one column on mobile;
- `background: var(--surface)`;
- `border: 1px solid rgba(17, 17, 17, 0.06)`;
- `box-shadow: var(--shadow-soft)`;
- no image;
- headings use `--ink`, body text uses `--muted`.
- one short practical condition can use `--accent-strong` when it must read as emphasis, not as a link.

New card variants must define:

- role;
- allowed pages;
- surface token;
- border behavior;
- shadow behavior;
- image behavior;
- contrast requirements.

## Variants

No visual variant is implicit. To create one:

1. Add it to this registry.
2. Add CSS with a named modifier class.
3. Add or update the homepage/apply example when it affects visible composition.
4. Add or update `tools/check-design.py` when the rule can be checked automatically.
