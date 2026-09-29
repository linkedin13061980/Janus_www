import type { Locale } from './utils';

// Liste des routes réellement existantes, calculée à partir des fichiers de /src/pages.
// Sert au sélecteur de langue : on ne propose jamais une version qui n'existe pas (pas de 404).
const pageFiles = import.meta.glob('/src/pages/**/*.astro');

const routes = new Set(
  Object.keys(pageFiles).map((file) =>
    file
      .replace('/src/pages', '')
      .replace(/\.astro$/, '')
      .replace(/\/index$/, '/'),
  ),
);

// Équivalences certaines entre langues lorsque l'URL diffère d'une langue à l'autre.
const equivalents: Record<Locale, string>[] = [
  { fr: '/cas-clients', en: '/case-studies', pl: '/realizacje' },
];

// Page de repli validée lorsqu'une page n'existe qu'en français :
// le marché Pologne renvoie vers « Investir en Pologne », qui existe en EN et en PL.
// La page pilier France–Pologne suit la même règle, et une page langue renvoie vers la page « Langues ».
const fallbacks: Record<string, string> = {
  '/marches/pologne': '/pologne-investir',
  '/pologne': '/pologne-investir',
};
const prefixFallbacks: [string, string][] = [['/langues/', '/langues']];

const exists = (path: string) => routes.has(path) || routes.has(path.replace(/\/$/, ''));

/** URL de la page courante dans la langue `loc`, ou null si aucune version n'existe. */
export function localizedPath(currentPath: string, loc: Locale): string | null {
  for (const eq of equivalents) {
    if (Object.values(eq).includes(currentPath)) return `/${loc}${eq[loc]}`;
  }
  const direct = `/${loc}${currentPath}`;
  if (exists(direct)) return direct;
  const fallback =
    fallbacks[currentPath] ?? prefixFallbacks.find(([prefix]) => currentPath.startsWith(prefix))?.[1];
  if (fallback && exists(`/${loc}${fallback}`)) return `/${loc}${fallback}`;
  return null;
}
