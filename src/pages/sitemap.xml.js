import { site } from '../data/site.js';
import { getCollection } from 'astro:content';
import { isDuplicateMaterialSlug, isHiddenMaterialSlug } from '../lib/material-duplicates.js';

const routes = [
  { path: '/', priority: '1.0' },
  { path: '/navigator/', priority: '0.8' },
];

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const urlFor = (path) => new URL(path, site.url).href;

export async function GET() {
  const materials = await getCollection('materials');
  const materialRoutes = materials
    .filter((entry) => !isDuplicateMaterialSlug(entry.id) && !isHiddenMaterialSlug(entry.id))
    .map((entry) => ({
      path: `/materials/${entry.id}/`,
      priority: '0.7',
    }));
  const urls = [...routes, ...materialRoutes].map((route) => [
    '  <url>',
    `    <loc>${escapeXml(urlFor(route.path))}</loc>`,
    `    <priority>${route.priority}</priority>`,
    '  </url>',
  ].join('\n'));
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
