'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/woocommerce';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/woocommerce';

interface Recommendation {
    product: Product;
    reason: string;
    confidence: number;
}

interface ProductRecommendationsProps {
    currentProduct?: Product;
    userPreferences?: string[];
    maxRecommendations?: number;
    className?: string;
}

export function ProductRecommendations({
    currentProduct,
    userPreferences = [],
    maxRecommendations = 4,
    className,
}: ProductRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<Record<number, 'like' | 'dislike'>>({});

    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                limit: maxRecommendations.toString(),
            });

            if (currentProduct) {
                params.append('productId', currentProduct.id.toString());
            }

            if (userPreferences.length > 0) {
                params.append('preferences', userPreferences.join(','));
            }

            const response = await fetch(`/api/recommendations?${params}`);
            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedback = async (productId: number, type: 'like' | 'dislike') => {
        setFeedback((prev) => ({ ...prev, [productId]: type }));

        // Send feedback to API (for learning)
        try {
            await fetch('/api/recommendations/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    currentProductId: currentProduct?.id,
                    feedback: type,
                }),
            });
        } catch (error) {
            console.error('Failed to send feedback:', error);
        }
    };

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if product has variations
        const hasVariations = product.type === 'variable' &&
            product.variations &&
            product.variations.length > 0;

        if (hasVariations) {
            // Redirect to product page to select variations
            window.location.href = `/product/${product.slug}`;
        } else {
            // Add simple product directly to cart
            const cartStore = useCartStore.getState();
            cartStore.addItem(product, 1);
        }
    };

    // Auto-fetch on mount (client-side only)
    useEffect(() => {
        fetchRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (recommendations.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-secondary-500" />
                    <h2 style={{ fontSize: '20px' }} className="font-heading font-semibold text-primary-950 dark:text-primary-50">
                        {currentProduct ? 'You May Also Like' : 'Recommended For You'}
                    </h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchRecommendations}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: maxRecommendations }).map((_, i) => (
                        <Card key={i} className="h-64 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {recommendations.map(({ product, reason, confidence }) => (
                        <Card key={product.id} className="group relative overflow-hidden transition-all hover:shadow-lg">
                            <Link href={`/product/${product.slug}`}>
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0].src}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Sparkles className="h-12 w-12 text-neutral-400" />
                                        </div>
                                    )}
                                    {confidence > 80 && (
                                        <Badge className="absolute right-2 top-2 bg-secondary-600">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            Top Pick
                                        </Badge>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 style={{ fontSize: '15px' }} className="mb-1 line-clamp-2 font-heading font-medium text-primary-950 dark:text-primary-50">
                                        {product.name}
                                    </h3>
                                    <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                                        {reason}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-heading text-lg font-bold text-primary-700 dark:text-primary-400">
                                            {formatPrice(product.price, 'SEK')}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    'h-7 w-7 p-0',
                                                    feedback[product.id] === 'like' && 'text-green-600'
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleFeedback(product.id, 'like');
                                                }}
                                            >
                                                <ThumbsUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    'h-7 w-7 p-0',
                                                    feedback[product.id] === 'dislike' && 'text-red-600'
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleFeedback(product.id, 'dislike');
                                                }}
                                            >
                                                <ThumbsDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            {/* Add to Cart Plus Button */}
                            <Button
                                size="icon"
                                className="absolute bottom-4 right-4 h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all z-10 opacity-0 group-hover:opacity-100"
                                onClick={(e) => handleAddToCart(product, e)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}

            <p className="text-center text-xs text-neutral-500">
                <Sparkles className="mr-1 inline h-3 w-3" />
                Recommendations powered by smart algorithms
            </p>
        </div>
    );
}
