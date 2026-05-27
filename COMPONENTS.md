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
- `image-showcase` — heading, optional text, plus one large centered image or screenshot.
- `two-column-list` — two or more list panels in a responsive grid.
- `centered-summary` — compact centered statement, price, terms, or key condition.
- `faq-accordion` — question and answer list.
- `cta-panel` — closing action panel.

Allowed template controls:

- `surface`: `white` or `muted`.
- `columns`: `1`, `2`, `3`, or `4` where the template supports grids; `cardStyle: media` with `columns: 1` renders repeated media rows.
- `cardStyle`: `plain`, `module`, or `media`; use `module` for compact scan cards with one key fact, and `media` for image-led cards where the image is part of the content argument.
- `captionPlacement`: caption layout for image-led cards where the text is tied to the screenshot/photo, not a separate text column.
- `captionPlacement: below-media` places title and text together under the image.
- `captionPlacement: title-above-media` places the card title above a large image and keeps a muted caption below it; use for detailed screenshots that need most of the container width.
- `wideLast`: boolean for grid layouts that need the final card to span the row.
- `spacing`: `connected` for neighboring sections that form one narrative group and need the same compact distance between blocks.
- `size`: `normal`, `large`, or `wide` for `image-showcase`; use `wide` only for detailed screenshots that need the full container width.
- `align: center` for `image-showcase` when the section is primarily a centered visual proof or gallery.

New templates are allowed only for a new layout composition. New subject matter should use an existing template.

## Hero Context

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

- as a filled chip;
- with beige fill or border.

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
- module card;
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
- one short practical condition can use the shared `.text-accent-practical` role when it must read as emphasis, not as a link.

New card variants must define:

- role;
- allowed pages;
- surface token;
- border behavior;
- shadow behavior;
- image behavior;
- contrast requirements.

### `module-card`

Use for compact factual cards in a `card-grid` where each card carries one practical answer: schedule, format, price, curriculum module, or similar.

Default:

- white surface;
- subtle neutral border;
- `--shadow-soft` for separation on white backgrounds;
- optional `subtitle` can carry one key fact such as duration or price;
- optional `.text-accent-practical` can emphasize a short practical condition.

## Variants

No visual variant is implicit. To create one:

1. Add it to this registry.
2. Add CSS with a named modifier class.
3. Add or update the homepage/apply example when it affects visible composition.
4. Add or update `tools/check-design.py` when the rule can be checked automatically.
