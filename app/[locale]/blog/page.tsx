import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPostsPaginated } from '@/lib/wordpress';
import { Post } from '@/lib/wordpress.d';
import { brandConfig } from '@/config/brand.config';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/site.config';

interface SwedishBlogPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: SwedishBlogPageProps): Promise<Metadata> {
  const { locale } = await params;

  // Only 'sv' is allowed
  if (locale !== 'sv') {
    notFound();
  }

  const url = `${siteConfig.site_domain}/sv/blog`;
  const urlEn = `${siteConfig.site_domain}/blog`;

  return {
    title: `Blogg - ${brandConfig.businessName}`,
    description: `Läs de senaste artiklarna, recepten och nyheter från ${brandConfig.businessName}. Upptäck autentiska ${brandConfig.cuisineType} mattips, matlagningstekniker och restauranguppdateringar.`,
    openGraph: {
      title: `Blogg - ${brandConfig.businessName}`,
      description: `Läs de senaste artiklarna, recepten och nyheter från ${brandConfig.businessName}.`,
      url: url,
      siteName: brandConfig.businessName,
      type: 'website',
      locale: 'sv_SE',
    },
    alternates: {
      canonical: url,
      languages: {
        'en': urlEn,
        'en-SE': urlEn,
        'sv': url,
        'sv-SE': url,
        'x-default': urlEn,
      },
    },
  };
}

// Helper function to format date in Swedish
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to strip HTML tags from excerpt
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Helper function to get featured image URL
function getFeaturedImageUrl(post: any): string {
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return 'https://anmolsweets.se/wp-content/uploads/2025/09/lunch-buffet-web.jpg';
}

// Helper function to get author name
function getAuthorName(post: any): string {
  if (post._embedded?.author?.[0]?.name) {
    return post._embedded.author[0].name;
  }
  return brandConfig.businessName;
}

// Helper function to get category names
function getCategoryNames(post: any): string[] {
  if (post._embedded?.['wp:term']?.[0]) {
    return post._embedded['wp:term'][0].map((cat: any) => cat.name);
  }
  return [];
}

export default async function SwedishBlogPage({ params }: SwedishBlogPageProps) {
  const { locale } = await params;

  // Only 'sv' is allowed
  if (locale !== 'sv') {
    notFound();
  }

  let posts: Post[] = [];
  let error: string | null = null;

  try {
    const response = await getPostsPaginated(1, 12);
    posts = response.data;
  } catch (err) {
    error = 'Kunde inte ladda blogginlägg. Försök igen senare.';
    console.error('Error fetching blog posts:', err);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Vår Blogg
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Upptäck autentiska recept, mattips och de rika kulinariska traditionerna i indisk och pakistansk matlagning i Sverige.
          </p>
        </div>
      </section>

      {/* Featured Static Post (Internal) */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-background rounded-3xl overflow-hidden shadow-sm border p-4 md:p-6">
            <div className="relative w-full md:w-1/2 aspect-[16/9] rounded-2xl overflow-hidden flex-shrink-0">
              <Image
                src="/images/blog/indian-fika-hero.png"
                alt="The Indian Fika"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Redaktörens Val
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="text-sm font-medium text-primary uppercase tracking-widest">Kultur & Matlagning</div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading">The Indian Fika: 5 Salta Snacks att Para med Ditt Te</h2>
              <p className="text-muted-foreground line-clamp-3">
                Upplev den perfekta blandningen av svensk tradition och sydasiatisk krydda. Upptäck de bästa samosorna, namkeen och kexen som förvandlar varje fikapaus till ett smakäventyr.
              </p>
              <Button asChild className="rounded-full px-8">
                <Link href="/sv/blog/the-indian-fika">Läs Guiden</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Inga blogginlägg hittades. Kom tillbaka snart för nytt innehåll!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => {
                const imageUrl = getFeaturedImageUrl(post);
                const authorName = getAuthorName(post);
                const categories = getCategoryNames(post);
                const excerpt = stripHtml(post.excerpt.rendered);

                return (
                  <article
                    key={post.id}
                    className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 dark:border-neutral-800"
                  >
                    {/* Featured Image */}
                    <Link href={`/sv/blog/${post.slug}`} className="block relative h-56 overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={post.title.rendered}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {categories.length > 0 && (
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="px-3 py-1 bg-secondary-500 text-white text-xs font-medium rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta Information */}
                      <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{authorName}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <Link href={`/sv/blog/${post.slug}`}>
                        <h2 className="text-xl font-heading font-bold text-primary-900 dark:text-primary-50 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                          {post.title.rendered}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3">
                        {excerpt}
                      </p>

                      {/* Read More Link */}
                      <Link
                        href={`/sv/blog/${post.slug}`}
                        className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        Läs Mer
                        <svg
                          className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
