import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Facebook, Twitter, Linkedin, Mail, MessageCircle, MapPin } from 'lucide-react';
import { getPostBySlug, getAllPosts } from '@/lib/wordpress';
import { getProducts } from '@/lib/woocommerce/products-direct';
import { brandProfile } from '@/config/brand-profile';
import { decodeHtmlEntities } from '@/lib/utils';
import { wordPressArticleSchema, breadcrumbSchema, postBreadcrumbs } from '@/lib/schema';
import { siteConfig } from '@/site.config';

type Props = {
  params: Promise<{ slug: string }>;
};

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getFeaturedImageUrl(post: any): string | null {
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return null;
}

function getAuthorInfo(post: any): { name: string; avatar?: string } {
  if (post._embedded?.author?.[0]) {
    const author = post._embedded.author[0];
    return {
      name: author.name,
      avatar: author.avatar_urls?.['96'] || author.avatar_urls?.['48']
    };
  }
  return { name: 'Ideal Indiska Livs' };
}

function getCategories(post: any): Array<{ id: number; name: string; slug: string }> {
  if (post._embedded?.['wp:term']?.[0]) {
    return post._embedded['wp:term'][0];
  }
  return [];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').substring(0, 160);
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: 'Post Not Found',
      };
    }

    const excerpt = stripHtml(post.excerpt.rendered);
    const imageUrl = getFeaturedImageUrl(post);
    const decodedTitle = decodeHtmlEntities(post.title.rendered);

    return {
      title: `${decodedTitle} - ${brandProfile.name}`,
      description: excerpt,
      openGraph: {
        title: decodedTitle,
        description: excerpt,
        type: 'article',
        publishedTime: post.date,
        modifiedTime: post.modified,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post: any = null;
  let promotionProducts: any[] = [];
  let recentPosts: any[] = [];

  try {
    // Fetch post, promotions, and recent posts in parallel
    [post, { data: promotionProducts }, recentPosts] = await Promise.all([
      getPostBySlug(slug),
      getProducts({ per_page: 4, on_sale: true, orderby: 'date', order: 'desc' }),
      getAllPosts().catch(() => [])
    ]);
  } catch (error) {
    console.error('Error fetching data:', error);
    notFound();
  }

  if (!post) {
    notFound();
  }

  const imageUrl = getFeaturedImageUrl(post);
  const author = getAuthorInfo(post);
  const categories = getCategories(post);
  const decodedTitle = decodeHtmlEntities(post.title.rendered);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ideallivs.com'}/blog/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header with Featured Image Background */}
      <section className="relative overflow-hidden">
        {imageUrl ? (
          <>
            {/* Background Image */}
            <div className="absolute inset-0 h-full w-full">
              <Image
                src={imageUrl}
                alt={decodedTitle}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl py-24 md:py-32 lg:py-40">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-white/80">
                  <li><Link href="/" className="hover:text-white">Home</Link></li>
                  <li>/</li>
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                  {categories.length > 0 && (
                    <>
                      <li>/</li>
                      <li className="text-white">{categories[0].name}</li>
                    </>
                  )}
                </ol>
              </nav>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 max-w-4xl">
                {decodedTitle}
              </h1>

              {/* Meta & Social Share */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Author & Date */}
                <div className="flex items-center gap-4 text-white/90">
                  {author.avatar && (
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white/20"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{author.name}</p>
                    <p className="text-sm text-white/70 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.date)}
                    </p>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Facebook className="h-4 w-4" />
                    <span className="hidden sm:inline">Facebook</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(decodedTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="hidden sm:inline">Twitter</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(decodedTitle)}&body=${encodeURIComponent(currentUrl)}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#EA4335] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(decodedTitle + ' ' + currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Text-only hero
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl py-16 md:py-20">
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li>/</li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                {categories.length > 0 && (
                  <>
                    <li>/</li>
                    <li className="text-foreground">{categories[0].name}</li>
                  </>
                )}
              </ol>
            </nav>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 max-w-4xl">
              {decodedTitle}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center gap-4">
                {author.avatar && (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-primary/20"
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">{author.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  <Facebook className="h-4 w-4" /> <span className="hidden sm:inline">Facebook</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(decodedTitle)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  <Twitter className="h-4 w-4" /> <span className="hidden sm:inline">Twitter</span>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  <Linkedin className="h-4 w-4" /> <span className="hidden sm:inline">LinkedIn</span>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(decodedTitle)}&body=${encodeURIComponent(currentUrl)}`} className="flex items-center gap-2 px-4 py-2 bg-[#EA4335] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  <Mail className="h-4 w-4" /> <span className="hidden sm:inline">Email</span>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(decodedTitle + ' ' + currentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Two-Column Layout: Content + Sidebar */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-8">
              {/* Hide WordPress social share buttons and related posts */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  /* Hide social share buttons from WordPress content */
                  .page-content .sharedaddy,
                  .page-content .wp-block-jetpack-sharing-buttons,
                  .page-content .social-share,
                  .page-content .share-buttons,
                  .page-content [class*="social-share"],
                  .page-content [class*="share-button"] {
                    display: none !important;
                  }
                  
                  /* Hide related posts sections */
                  .page-content .related-posts,
                  .page-content .wp-block-latest-posts,
                  .page-content [class*="related-articles"],
                  .page-content [class*="recent-posts"] {
                    display: none !important;
                  }
                  
                  /* Fix comment section headings */
                  .page-content h2,
                  .page-content h3 {
                    font-weight: 600 !important;
                  }
                `
              }} />

              <div
                className="page-content prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-8">
                {/* Latest Promotions */}
                {promotionProducts.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-heading font-bold text-primary mb-4">Latest Promotions</h3>
                    <div className="space-y-4">
                      {promotionProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          className="flex gap-3 group"
                        >
                          {product.images[0] && (
                            <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                              <Image
                                src={product.images[0].src}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="80px"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                              {decodeHtmlEntities(product.name)}
                            </h4>
                            <p className="text-sm font-bold text-primary mt-1">
                              {product.price} SEK
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/shop?on_sale=true"
                      className="block mt-4 text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      View All Promotions
                    </Link>
                  </div>
                )}

                {/* Store Location Map */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Our Store Location
                  </h3>
                  <div className="rounded-lg overflow-hidden mb-4">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2038.769278826918!2d18.048690399999998!3d59.2700036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f77d07b5889cf%3A0xd20e7ba594e09663!2sIdeal%20Indiska%20Livs%20Bandhagen!5e0!3m2!1sen!2s!4v1765922506900!5m2!1sen!2s"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Ideal Indiska Livs</p>
                    <p>Bandhagsplan 4</p>
                    <p>12432 Bandhagen Centrum</p>
                    <p>Stockholm, Sweden</p>
                    <a href="tel:+46728494801" className="text-primary hover:underline mt-2 block">
                      +46 728 494 801
                    </a>
                  </div>
                </div>

                {/* Recent Articles */}
                {recentPosts && recentPosts.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-heading font-bold text-primary mb-4">Recent Articles</h3>
                    <div className="space-y-4">
                      {recentPosts.filter((recentPost: any) => recentPost.slug !== slug).slice(0, 4).map((recentPost: any) => (
                        <Link
                          key={recentPost.id}
                          href={`/blog/${recentPost.slug}`}
                          className="block group"
                        >
                          <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                            {decodeHtmlEntities(recentPost.title.rendered)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(recentPost.date)}
                          </p>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/blog"
                      className="block mt-4 text-center px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                    >
                      View All Articles
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(wordPressArticleSchema(post, siteConfig.site_domain))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(
            postBreadcrumbs(
              {
                title: decodedTitle,
                category: categories[0] ? {
                  name: categories[0].name,
                  slug: categories[0].slug
                } : { name: 'Blog', slug: 'blog' },
              },
              siteConfig.site_domain
            )
          ))
        }}
      />
    </div>
  );
}
