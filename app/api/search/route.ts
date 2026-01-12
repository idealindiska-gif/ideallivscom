import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/woocommerce';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        console.log('[Search API] Searching for:', query);

        // Fetch products with search query
        const { data: products } = await getProducts({
            search: query,
            per_page: 10,
        });

        console.log('[Search API] Found products:', products.length);

        // Transform to search results
        const results = products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.images?.[0]?.src,
            categories: product.categories?.map((cat) => cat.name) || [],
            relevance: calculateRelevance(product, query),
        }));

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);

        // Cache search results on CDN for 15 minutes
        return NextResponse.json({ results }, {
            headers: {
                'Cache-Control': 's-maxage=900, stale-while-revalidate=1800',
            },
        });
    } catch (error: any) {
        console.error('[Search API] Error details:', {
            message: error?.message,
            status: error?.status,
            code: error?.code,
            stack: error?.stack,
        });

        return NextResponse.json({
            results: [],
            error: error?.message || 'Search failed',
            details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        }, { status: 500 });
    }
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevance(product: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const lowerName = product.name.toLowerCase();
    const lowerDesc = (product.description || '').toLowerCase();
    const lowerShortDesc = (product.short_description || '').toLowerCase();

    // 1. Title Match (Primary Priority)
    if (lowerName === lowerQuery) {
        score += 100; // Exact Name Match
    } else if (lowerName.startsWith(lowerQuery)) {
        score += 90; // Starts With
    } else if (lowerName.includes(` ${lowerQuery} `) || lowerName.includes(`${lowerQuery} `) || lowerName.includes(` ${lowerQuery}`)) {
        score += 85; // Whole Word Match
    } else if (lowerName.includes(lowerQuery)) {
        score += 70; // Contain Match
    } else {
        // Fuzzy / Partial Word in Title
        const queryWords = lowerQuery.split(/\s+/).filter((w: string) => w.length > 0);
        const nameWords = lowerName.split(/\s+/);

        let matchCount = 0;
        for (const qWord of queryWords) {
            if (nameWords.some((nWord: string) => nWord.includes(qWord))) {
                matchCount++;
            }
        }

        if (matchCount > 0) {
            score += (matchCount / queryWords.length) * 50;
        }
    }

    // 2. Content Match (Secondary Priority)
    // Only add content score if it's not already a strong title match (to differentiate low title scores)
    // or as a tie-breaker.
    const inDesc = lowerDesc.includes(lowerQuery);
    const inShortDesc = lowerShortDesc.includes(lowerQuery);

    if (inDesc || inShortDesc) {
        score += 15;
    }

    // 3. Category Prioritization
    const categories = product.categories || [];
    const isGrocery = categories.some((c: any) =>
        c.slug === 'groceries' ||
        c.name.toLowerCase().includes('grocery') ||
        c.slug === 'ingredients'
    );
    const isRestaurant = categories.some((c: any) =>
        c.slug === 'restaurant' ||
        c.name.toLowerCase().includes('restaurant') ||
        c.name.toLowerCase().includes('food') || // Generic fallback
        c.slug === 'starters' ||
        c.slug === 'main-course'
    );
    const isSweets = categories.some((c: any) =>
        c.slug === 'sweets' ||
        c.name.toLowerCase().includes('sweet') ||
        c.slug === 'bakery'
    );

    if (isRestaurant || isSweets) {
        score += 10; // Boost Restaurant & Sweets
    }

    if (isGrocery) {
        // Penalize Grocery unless it's a very strong title match (Exact or Starts With)
        if (score < 85) {
            score -= 30; // Push to bottom
        }
    }

    return score;
}
