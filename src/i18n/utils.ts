import fr from './fr.json';
import en from './en.json';
import pl from './pl.json';

export type Locale = 'fr' | 'en' | 'pl';

const translations = { fr, en, pl };

export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en' || lang === 'pl') return lang;
  return 'fr';
}

export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

export const localeNames: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  pl: 'PL',
};
