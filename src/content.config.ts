import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
  style: z.enum(['primary', 'secondary', 'quiet', 'accent']).optional(),
  target: z.string().optional(),
  rel: z.string().optional(),
});

const formField = z.object({
  name: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  hint: z.string().optional(),
  autocomplete: z.string().optional(),
  required: z.boolean().optional(),
});

const ctaForm = z.object({
  endpoint: z.string(),
  submitLabel: z.string(),
  successText: z.string(),
  errorText: z.string(),
  fields: z.array(formField).min(1),
  consent: z.object({
    text: z.string(),
    linkLabel: z.string(),
    href: z.string(),
  }).optional(),
  directText: z.string().optional(),
  directLinks: z.array(action).optional(),
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

const curriculumSection = z.object({
  title: z.string(),
  text: z.string().optional(),
  items: z.array(z.string()).optional(),
});

const curriculumModule = z.object({
  title: z.string(),
  media: media.optional(),
  intro: z.array(z.string()).optional(),
  sections: z.array(curriculumSection).optional(),
});

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
  mediaPlacement: z.enum(['left', 'right']).optional(),
  mediaAlign: z.enum(['top']).optional(),
  media,
  mediaTitle: z.string().optional(),
  mediaText: z.string().optional(),
  title: z.string(),
  lead: z.string().optional(),
  detailLabel: z.string().optional(),
  detailColumns: z.union([z.literal(1), z.literal(2)]).optional(),
  detailStyle: z.enum(['list', 'bullets']).optional(),
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

const logoGridBlock = z.object({
  template: z.literal('logo-grid'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  logos: z.array(
    z.object({
      name: z.string(),
      media,
    }),
  ).min(1),
});

const faqAccordionBlock = z.object({
  template: z.literal('faq-accordion'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  items: z.array(textPair).min(1),
});

const curriculumAccordionBlock = z.object({
  template: z.literal('curriculum-accordion'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  modules: z.array(curriculumModule).min(1),
});

const ctaPanelBlock = z.object({
  template: z.literal('cta-panel'),
  id: z.string().optional(),
  surface,
  spacing,
  title: z.string(),
  text: z.string().optional(),
  action: action.optional(),
  form: ctaForm.optional(),
});

const block = z.discriminatedUnion('template', [
  heroSplitBlock,
  splitMediaBlock,
  cardGridBlock,
  mediaStackBlock,
  imageShowcaseBlock,
  twoColumnListBlock,
  centeredSummaryBlock,
  logoGridBlock,
  faqAccordionBlock,
  curriculumAccordionBlock,
  ctaPanelBlock,
]);

const pages = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/pages',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    blocks: z.array(block).min(1),
  }),
});

export const collections = { pages };
