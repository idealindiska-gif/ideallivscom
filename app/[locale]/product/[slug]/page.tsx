import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/woocommerce';
import { translateProduct, translateProducts } from '@/lib/translations';
import { ProductTemplate } from '@/components/templates';
import { siteConfig } from '@/site.config';
import type { Metadata } from 'next';

// ISR: Revalidate product pages every 2 hours
export const revalidate = 7200;

interface SwedishProductPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: SwedishProductPageProps): Promise<Metadata> {
    const { locale, slug } = await params;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    try {
        const product = await getProductBySlug(slug);

        if (!product) {
            return {
                title: 'Produkten hittades inte',
                robots: { index: false, follow: false },
            };
        }

        // Translate product to Swedish
        const translatedProduct = translateProduct(product, 'sv');

        const defaultImage = {
            url: 'https://crm.ideallivs.com/wp-content/uploads/2025/07/rice-and-flours-e1752149384409.jpg',
            width: 1200,
            height: 630,
            alt: `Ideal Indiska LIVS - Indiska och pakistanska livsmedel i Stockholm`,
        };

        const cleanDescription = translatedProduct.short_description?.replace(/\<[^>]*>/g, '').trim() || '';
        const metaDescription = cleanDescription
            ? cleanDescription.substring(0, 150) + " | Ideal Indiska LIVS: Färska livsmedel och kryddor levererade i Stockholm."
            : `Handla ${translatedProduct.name} på Ideal Indiska LIVS. Premium indiska och pakistanska livsmedel. Leverans samma dag i Stockholm. Hög kvalitet, autentiska produkter.`;

        const url = `${siteConfig.site_domain}/sv/product/${slug}`;
        const urlEn = `${siteConfig.site_domain}/product/${slug}`;

        return {
            title: `${translatedProduct.name} | Ideal Indiska LIVS - Autentiska livsmedel`,
            description: metaDescription.substring(0, 160),
            keywords: [
                translatedProduct.name,
                "Indiska livsmedel",
                "Pakistanska livsmedel",
                "Halal mat Stockholm",
                "Online livsmedelsbutik",
                ...(translatedProduct.categories?.map(c => c.name) || []),
            ],
            openGraph: {
                type: 'website',
                title: `${translatedProduct.name} | Ideal Indiska LIVS`,
                description: metaDescription.substring(0, 160),
                images: translatedProduct.images && translatedProduct.images.length > 0
                    ? translatedProduct.images.map((img) => ({
                        url: img.src,
                        width: 800,
                        height: 800,
                        alt: img.alt || translatedProduct.name,
                    }))
                    : [defaultImage],
                url: url,
                siteName: 'Ideal Indiska LIVS',
                locale: 'sv_SE',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${translatedProduct.name} | Ideal Indiska LIVS`,
                description: metaDescription.substring(0, 160),
                images: translatedProduct.images && translatedProduct.images.length > 0
                    ? [translatedProduct.images[0].src]
                    : [defaultImage.url],
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
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        };
    } catch {
        return {
            title: 'Produkten hittades inte',
            robots: { index: false, follow: false },
        };
    }
}

export default async function SwedishProductPage({ params }: SwedishProductPageProps) {
    const { locale, slug } = await params;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    let product;

    try {
        product = await getProductBySlug(slug);
    } catch (error) {
        notFound();
    }

    if (!product) {
        notFound();
    }

    // Translate product to Swedish
    const translatedProduct = translateProduct(product, 'sv');

    // Get related products and translate them
    const relatedProductsRaw = await getRelatedProducts(product.id);
    const relatedProducts = translateProducts(relatedProductsRaw, 'sv');

    // Build breadcrumbs with Swedish locale
    const breadcrumbs = [
        { label: 'Butik', href: '/sv/shop' },
        ...(translatedProduct.categories && translatedProduct.categories.length > 0
            ? [{
                label: translatedProduct.categories[0].name,
                href: `/sv/product-category/${translatedProduct.categories[0].slug}`
            }]
            : []),
        { label: translatedProduct.name },
    ];

    return (
        <ProductTemplate
            product={translatedProduct}
            breadcrumbs={breadcrumbs}
            relatedProducts={relatedProducts}
        />
    );
}
