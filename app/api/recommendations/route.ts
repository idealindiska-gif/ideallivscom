import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/woocommerce';
import type { Product } from '@/types/woocommerce';

interface Recommendation {
    product: Product;
    reason: string;
    confidence: number;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get('productId');
        const preferences = searchParams.get('preferences')?.split(',') || [];
        const limit = parseInt(searchParams.get('limit') || '4');

        // Fetch all products
        const { data: allProducts } = await getProducts({ per_page: 100 });

        let recommendations: Recommendation[] = [];

        if (productId) {
            // Find the current product
            const currentProduct = allProducts.find((p) => p.id === parseInt(productId));

            if (currentProduct) {
                recommendations = getRelatedRecommendations(currentProduct, allProducts);
            }
        } else if (preferences.length > 0) {
            recommendations = getPreferenceBasedRecommendations(preferences, allProducts);
        } else {
            // Default: popular/featured products
            recommendations = getPopularRecommendations(allProducts);
        }

        // Limit results
        recommendations = recommendations.slice(0, limit);

        // Cache recommendations on CDN for 1 hour
        return NextResponse.json({ recommendations }, {
            headers: {
                'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200',
            },
        });
    } catch (error) {
        console.error('Recommendations API error:', error);
        return NextResponse.json(
            { recommendations: [], error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}

/**
 * Get recommendations based on a specific product
 */
function getRelatedRecommendations(
    currentProduct: Product,
    allProducts: Product[]
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Filter out current product
    const otherProducts = allProducts.filter((p) => p.id !== currentProduct.id);

    // 1. Same category products
    const sameCategory = otherProducts.filter((product) =>
        product.categories?.some((cat: any) =>
            currentProduct.categories?.some((currentCat: any) => currentCat.id === cat.id)
        )
    );

    sameCategory.forEach((product) => {
        recommendations.push({
            product,
            reason: `Popular in ${currentProduct.categories?.[0]?.name || 'this category'}`,
            confidence: 85,
        });
    });

    // 2. Similar price range
    const currentPrice = parseFloat(currentProduct.price);
    const priceRange = currentPrice * 0.3; // 30% range

    const similarPrice = otherProducts.filter((product) => {
        const price = parseFloat(product.price);
        return Math.abs(price - currentPrice) <= priceRange;
    });

    similarPrice.forEach((product) => {
        if (!recommendations.find((r) => r.product.id === product.id)) {
            recommendations.push({
                product,
                reason: 'Similar price range',
                confidence: 70,
            });
        }
    });

    // 3. Same tags
    if (currentProduct.tags && currentProduct.tags.length > 0) {
        const sameTags = otherProducts.filter((product) =>
            product.tags?.some((tag) =>
                currentProduct.tags?.some((currentTag) => currentTag.id === tag.id)
            )
        );

        sameTags.forEach((product) => {
            if (!recommendations.find((r) => r.product.id === product.id)) {
                recommendations.push({
                    product,
                    reason: 'Similar style',
                    confidence: 75,
                });
            }
        });
    }

    // 4. Featured products
    const featured = otherProducts.filter((p) => p.featured);
    featured.forEach((product) => {
        if (!recommendations.find((r) => r.product.id === product.id)) {
            recommendations.push({
                product,
                reason: 'Chef\'s recommendation',
                confidence: 90,
            });
        }
    });

    // Sort by confidence
    return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get recommendations based on user preferences
 */
function getPreferenceBasedRecommendations(
    preferences: string[],
    allProducts: Product[]
): Recommendation[] {
    const recommendations: Recommendation[] = [];

    allProducts.forEach((product) => {
        let matchScore = 0;
        const matchedPreferences: string[] = [];

        // Check categories
        product.categories?.forEach((cat) => {
            if (preferences.some((pref) => cat.name.toLowerCase().includes(pref.toLowerCase()))) {
                matchScore += 30;
                matchedPreferences.push(cat.name);
            }
        });

        // Check tags
        product.tags?.forEach((tag) => {
            if (preferences.some((pref) => tag.name.toLowerCase().includes(pref.toLowerCase()))) {
                matchScore += 20;
                matchedPreferences.push(tag.name);
            }
        });

        // Check name
        preferences.forEach((pref) => {
            if (product.name.toLowerCase().includes(pref.toLowerCase())) {
                matchScore += 25;
                matchedPreferences.push(pref);
            }
        });

        if (matchScore > 0) {
            recommendations.push({
                product,
                reason: `Matches your taste: ${matchedPreferences[0] || 'your preferences'}`,
                confidence: Math.min(matchScore, 95),
            });
        }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get popular/featured recommendations
 */
function getPopularRecommendations(allProducts: Product[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Featured products
    const featured = allProducts.filter((p) => p.featured);
    featured.forEach((product) => {
        recommendations.push({
            product,
            reason: 'Chef\'s special',
            confidence: 95,
        });
    });

    // On sale products
    const onSale = allProducts.filter((p) => p.on_sale);
    onSale.forEach((product) => {
        if (!recommendations.find((r) => r.product.id === product.id)) {
            recommendations.push({
                product,
                reason: 'Special offer',
                confidence: 85,
            });
        }
    });

    // High-rated products (if ratings available)
    const highRated = allProducts
        .filter((p) => parseFloat(p.average_rating) >= 4.5)
        .sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));

    highRated.forEach((product) => {
        if (!recommendations.find((r) => r.product.id === product.id)) {
            recommendations.push({
                product,
                reason: 'Highly rated',
                confidence: 90,
            });
        }
    });

    // Popular (by total sales)
    const popular = allProducts
        .filter((p) => p.total_sales > 0)
        .sort((a, b) => b.total_sales - a.total_sales);

    popular.forEach((product) => {
        if (!recommendations.find((r) => r.product.id === product.id)) {
            recommendations.push({
                product,
                reason: 'Customer favorite',
                confidence: 80,
            });
        }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
}
