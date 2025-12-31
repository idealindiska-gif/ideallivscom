/**
 * Hreflang Tags for International SEO
 * Tells search engines which language/region versions exist
 */

interface HreflangTagsProps {
  canonicalUrl: string;
}

export function HreflangTags({ canonicalUrl }: HreflangTagsProps) {
  return (
    <>
      {/* Swedish version (main) */}
      <link rel="alternate" hrefLang="sv-SE" href={canonicalUrl} />

      {/* Swedish language (general) */}
      <link rel="alternate" hrefLang="sv" href={canonicalUrl} />

      {/* English for Swedish market (secondary) */}
      <link rel="alternate" hrefLang="en-SE" href={canonicalUrl} />

      {/* Default/fallback */}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
    </>
  );
}
