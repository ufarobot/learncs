import { site } from '../data/site.js';

const routes = [
  { path: '/', priority: '1.0' },
];

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const urlFor = (path) => new URL(path, site.url).href;

export function GET() {
  const urls = routes.map((route) => [
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
