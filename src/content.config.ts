import { defineCollection, z } from 'astro:content';

const textPair = z.tuple([z.string(), z.string()]);

const heroFact = z.union([
  textPair,
  z.object({
    title: z.string(),
    text: z.string(),
    emphasis: z.string().optional(),
  }),
]);

const action = z.object({
  label: z.string(),
  href: z.string(),
  style: z.enum(['primary', 'secondary', 'quiet']).optional(),
});

const media = z.object({
  src: z.string(),
  alt: z.string(),
});

const card = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  text: z.string().optional(),
  media: media.optional(),
  items: z.array(z.string()).optional(),
  note: z.string().optional(),
  emphasis: z.string().optional(),
  action: action.optional(),
  wide: z.boolean().optional(),
});

const surface = z.enum(['white', 'muted']).optional();
const spacing = z.enum(['connected']).optional();

const heroSplitBlock = z.object({
  template: z.literal('hero-split'),
  id: z.string().optional(),
  pretitle: z.string(),
  title: z.string(),
  lead: z.string(),
  languages: z.string().optional(),
  media,
  actions: z.array(action).min(1),
  facts: z.array(heroFact).min(1),
});

const splitMediaBlock = z.object({
  template: z.literal('split-media'),
  id: z.string().optional(),
  surface,
  spacing,
  headingPlacement: z.enum(['side', 'top']).optional(),
  media,
  mediaTitle: z.string().optional(),
  mediaText: z.string().optional(),
  title: z.string(),
  lead: z.string().optional(),
  detailLabel: z.string().optional(),
  detailColumns: z.union([z.literal(1), z.literal(2)]).optional(),
  detailCardTone: z.enum(['green']).optional(),
  cards: z.array(card).optional(),
  notes: z.array(z.string()).optional(),
  proof: z.string().optional(),
});

const cardGridBlock = z.object({
  template: z.literal('card-grid'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  action: action.optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  cardStyle: z.enum(['plain', 'module', 'media']).optional(),
  captionPlacement: z.enum(['below-media', 'title-above-media']).optional(),
  wideLast: z.boolean().optional(),
  cards: z.array(card).min(1),
  notes: z.array(z.string()).optional(),
});

const mediaStackBlock = z.object({
  template: z.literal('media-stack'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  body: z.array(z.string()).optional(),
  media: z.array(media).min(1),
  cards: z.array(card).optional(),
  metrics: z.array(textPair).optional(),
});

const imageShowcaseBlock = z.object({
  template: z.literal('image-showcase'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  align: z.enum(['center']).optional(),
  media,
  size: z.enum(['normal', 'large', 'wide']).optional(),
  metrics: z.array(textPair).optional(),
});

const twoColumnListBlock = z.object({
  template: z.literal('two-column-list'),
  id: z.string().optional(),
  surface,
  spacing,
  columns: z.array(
    z.object({
      title: z.string(),
      tone: z.enum(['default', 'muted']).optional(),
      items: z.array(z.string()).min(1),
    }),
  ).min(1),
});

const centeredSummaryBlock = z.object({
  template: z.literal('centered-summary'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  lines: z.array(z.string()).min(1),
  highlight: z.string().optional(),
});

const faqAccordionBlock = z.object({
  template: z.literal('faq-accordion'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  items: z.array(textPair).min(1),
});

const ctaPanelBlock = z.object({
  template: z.literal('cta-panel'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  action,
});

const block = z.discriminatedUnion('template', [
  heroSplitBlock,
  splitMediaBlock,
  cardGridBlock,
  mediaStackBlock,
  imageShowcaseBlock,
  twoColumnListBlock,
  centeredSummaryBlock,
  faqAccordionBlock,
  ctaPanelBlock,
]);

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    blocks: z.array(block).min(1),
  }),
});

export const collections = { pages };
