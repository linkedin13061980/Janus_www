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
  // Page pilier France–Pologne : URL traduite dans chaque langue.
  { fr: '/pologne', en: '/poland', pl: '/francja-polska' },
];

// Page de repli validée lorsqu'une page n'existe qu'en français :
// le marché Pologne renvoie vers « Investir en Pologne », qui existe en EN et en PL.
// Une page langue renvoie vers la page « Langues ».
const fallbacks: Record<string, string> = {
  '/marches/pologne': '/pologne-investir',
};
const prefixFallbacks: [string, string][] = [['/langues/', '/langues']];

/** Chemins complets des versions FR/EN/PL d'une page dont l'URL diffère selon la langue, sinon null. */
export function equivalentPaths(currentPath: string): Record<Locale, string> | null {
  const eq = equivalents.find((e) => Object.values(e).includes(currentPath));
  return eq ? { fr: `/fr${eq.fr}`, en: `/en${eq.en}`, pl: `/pl${eq.pl}` } : null;
}

const exists = (path: string) => routes.has(path) || routes.has(path.replace(/\/$/, ''));

/**
 * Chemins hreflang de la page courante : uniquement les versions linguistiques qui existent réellement
 * (jamais de replis). Renvoie null s'il n'existe pas au moins deux versions.
 */
export function hreflangPaths(currentPath: string): Partial<Record<Locale, string>> | null {
  const eq = equivalentPaths(currentPath);
  if (eq) return eq;
  const out: Partial<Record<Locale, string>> = {};
  for (const loc of ['fr', 'en', 'pl'] as Locale[]) {
    const path = `/${loc}${currentPath}`;
    if (exists(path)) out[loc] = path;
  }
  return Object.keys(out).length >= 2 ? out : null;
}

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
