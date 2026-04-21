import type { APIRoute } from 'astro';

const site = 'https://agence-janus.fr';

const pages = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/contact', changefreq: 'monthly', priority: '0.9' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  { path: '/langues', changefreq: 'monthly', priority: '0.8' },
  { path: '/financement', changefreq: 'monthly', priority: '0.8' },
  { path: '/a-propos', changefreq: 'monthly', priority: '0.7' },
  { path: '/pologne-investir', changefreq: 'monthly', priority: '0.7' },
  { path: '/mentions-legales', changefreq: 'yearly', priority: '0.2' },
  { path: '/cgv', changefreq: 'yearly', priority: '0.2' },
  { path: '/rgpd', changefreq: 'yearly', priority: '0.2' },
  { path: '/cookies', changefreq: 'yearly', priority: '0.2' },
];

const locales = ['fr', 'en', 'pl'];

function buildUrls() {
  return pages.map(({ path, changefreq, priority }) => {
    const hreflangs = locales.map(loc => {
      const url = `${site}/${loc}${path === '/' ? '' : path}`;
      return `<xhtml:link rel="alternate" hreflang="${loc}" href="${url}"/>`;
    });
    hreflangs.push(
      `<xhtml:link rel="alternate" hreflang="x-default" href="${site}/fr${path === '/' ? '' : path}"/>`
    );

    // Use FR as canonical
    const loc = `${site}/fr${path === '/' ? '' : path}`;

    return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${hreflangs.join('\n    ')}
  </url>
${locales.filter(l => l !== 'fr').map(l => `  <url>
    <loc>${site}/${l}${path === '/' ? '' : path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${hreflangs.join('\n    ')}
  </url>`).join('\n')}`;
  }).join('\n');
}

export const GET: APIRoute = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${buildUrls()}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
