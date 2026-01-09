import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/woocommerce';
import { ProductTemplate } from '@/components/templates';
import { brandConfig } from '@/config/brand.config';
import { siteConfig } from '@/site.config';
import type { Metadata } from 'next';

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    try {
        const product = await getProductBySlug(resolvedParams.slug);

        if (!product) {
            return {
                title: 'Product Not Found',
                robots: { index: false, follow: false },
            };
        }

        // Default fallback image if product has no images
        const defaultImage = {
            url: 'https://crm.ideallivs.com/wp-content/uploads/2025/07/rice-and-flours-e1752149384409.jpg',
            width: 1200,
            height: 630,
            alt: `${brandConfig.businessName} - Indian & Pakistani Groceries in Stockholm`,
        };

        // Enhanced description for AI Overview and search snippets
        const cleanDescription = product.short_description?.replace(/\<[^>]*>/g, '').trim() || '';
        const metaDescription = cleanDescription
            ? cleanDescription.substring(0, 150) + " | Ideal Indiska LIVS: Fresh groceries & spices delivered in Stockholm."
            : `Shop ${product.name} at Ideal Indiska LIVS. Premium Indian & Pakistani groceries. Same-day delivery available in Stockholm. High quality, authentic products.`;

        const url = `${siteConfig.site_domain}/product/${resolvedParams.slug}`;

        // Analysis-driven metadata optimization for top performing keywords from Search Console
        const name = product.name.toLowerCase();
        let customTitle = `${product.name} | Ideal Indiska LIVS - Authentic Groceries`;
        let customDescription = metaDescription;

        // Target: Indian Costus / Qust al Hindi (High Impressions, Low CTR)
        if (name.includes('costus') || name.includes('qust')) {
            customTitle = `Original Indian Costus Powder (Qust al Hindi) Stockholm | Premium Quality`;
            customDescription = `Buy premium Indian Costus Powder (Qust al Hindi) in Stockholm. Known for its traditional health benefits. Pure, authentic, and in stock at Ideal Indiska LIVS.`;
        }
        // Target: Pan Parag (High Impressions)
        else if (name.includes('pan parag')) {
            customTitle = `Supreme Pan Parag 100g in Stockholm | Authentic Indian Mukhwas`;
            customDescription = `Get authentic Supreme Pan Parag 100g at Ideal Indiska LIVS Stockholm. The most trusted Indian pan masala for a fresh, authentic mouth-freshening experience.`;
        }
        // Target: Mustard Oil / Sarson ka Tel
        else if (name.includes('mustard oil') || name.includes('sarson')) {
            customTitle = `Pure Mustard Oil (Sarson ka Tel) Stockholm | Best Brands: Fortune & KTC`;
            customDescription = `Pure mustard oil for cooking & hair care. High-quality Fortune and KTC brands available in Stockholm. Rich in aroma and traditional nutrients. Shop now!`;
        }
        // Target: India Gate Sona Masoori Rice (Key Promotional Item)
        else if (name.includes('india gate') && (name.includes('sona masoori') || name.includes('rice'))) {
            customTitle = `India Gate Sona Masoori Rice Stockholm | Best Price & Fast Delivery`;
            customDescription = `Shop authentic India Gate Sona Masoori Rice and Basmati varieties at Ideal Indiska LIVS. Premium quality rice for perfect meals. Same-day delivery in Stockholm!`;
        }
        // Target: Elephant Atta (High Volume Keyword)
        else if (name.includes('elephant atta')) {
            customTitle = `Elephant Atta 25kg & 10kg Stockholm | Best Price in Bandhagen`;
            customDescription = `Looking for Elephant Atta in Stockholm? We stock Medium, Wholemeal, and White Elephant Atta in bulk sizes. Best prices and home delivery available. Shop at Ideal Indiska LIVS.`;
        }
        // Target: Aashirvaad Atta
        else if (name.includes('aashirvaad')) {
            customTitle = `Aashirvaad Svasti Ghee & Atta Stockholm | Authentic Indian Staples`;
            customDescription = `Buy Aashirvaad Whole Wheat Atta and Svasti Ghee in Stockholm. The most trusted Indian brand for rotis and parathas. Fresh stock and fast delivery at Ideal Indiska LIVS.`;
        }
        // Target: General Cooking Oils (Key Category)
        else if (name.includes('oil') || name.includes('ghee') || name.includes('ktc')) {
            customTitle = `${product.name} Stockholm | Pure Cooking Oils & Ghee`;
            customDescription = `Find the best deals on KTC oils, pure Ghee, and sunflower oils at Ideal Indiska LIVS. Authentic brands for your kitchen. Fast delivery across Stockholm.`;
        }

        // Add "On Sale" indicator to title if product is promotional
        if (product.on_sale) {
            customTitle = `PROMO: ${customTitle}`;
        }

        return {
            title: customTitle,
            description: customDescription.substring(0, 160),
            keywords: [
                product.name,
                "Indian groceries",
                "Pakistani groceries",
                "halal food Stockholm",
                "online grocery delivery",
                "Qust al Hindi Stockholm",
                "Mustard oil for hair Sweden",
                ...(product.categories?.map(c => c.name) || []),
            ],
            openGraph: {
                type: 'website',
                title: customTitle,
                description: customDescription.substring(0, 160),
                images: product.images && product.images.length > 0
                    ? product.images.map((img) => ({
                        url: img.src,
                        width: 800,
                        height: 800,
                        alt: img.alt || product.name,
                    }))
                    : [defaultImage],
                url: url,
                siteName: 'Ideal Indiska LIVS',
            },
            twitter: {
                card: 'summary_large_image',
                title: customTitle,
                description: customDescription.substring(0, 160),
                images: product.images && product.images.length > 0
                    ? [product.images[0].src]
                    : [defaultImage.url],
            },
            alternates: {
                canonical: url,
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
            title: 'Product Not Found',
            robots: { index: false, follow: false },
        };
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const resolvedParams = await params;
    let product;

    try {
        product = await getProductBySlug(resolvedParams.slug);
    } catch (error) {
        notFound();
    }

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.id);

    // Build breadcrumbs with new URL structure
    const breadcrumbs = [
        { label: 'Shop', href: '/shop' },
        ...(product.categories && product.categories.length > 0
            ? [{
                label: product.categories[0].name,
                href: `/product-category/${product.categories[0].slug}`
            }]
            : []),
        { label: product.name },
    ];

    return (
        <ProductTemplate
            product={product}
            breadcrumbs={breadcrumbs}
            relatedProducts={relatedProducts}
        />
    );
}
