export const locales = ['en', 'sv'] as const;
export const defaultLocale = 'en'; // Default locale has NO prefix

export type Locale = (typeof locales)[number];

// This tells next-intl that English doesn't need a prefix
export const localePrefix = 'as-needed'; // NOT 'always'
