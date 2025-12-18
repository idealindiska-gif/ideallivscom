'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/woocommerce';

interface SearchResult {
    id: number;
    name: string;
    slug: string;
    price: string;
    image?: string;
    categories: string[];
    relevance: number;
}

interface SmartSearchProps {
    className?: string;
    placeholder?: string;
    showTrending?: boolean;
}

export function SmartSearch({
    className,
    placeholder = "Search for dishes, ingredients, or cuisines...",
    showTrending = true
}: SmartSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recent-searches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data.results || []);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent-searches', JSON.stringify(updated));

        // Navigate to search results
        router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
        setIsOpen(false);
        setQuery('');
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recent-searches');
    };

    const trendingSearches = [
        'Biryani',
        'Samosa',
        'Gulab Jamun',
        'Tandoori',
        'Curry',
    ];

    return (
        <div ref={searchRef} className={cn('relative', className)}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                    type="search"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(query);
                        }
                    }}
                    className="pl-10 pr-10"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Search Dropdown */}
            {isOpen && (
                <Card className="absolute top-full z-50 mt-2 w-full overflow-hidden shadow-lg">
                    <div className="max-h-[500px] overflow-y-auto">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                            </div>
                        )}

                        {/* Search Results */}
                        {!isLoading && results.length > 0 && (
                            <div className="p-2">
                                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Results ({results.length})
                                </p>
                                {results.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={`/product/${result.slug}`}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setQuery('');
                                        }}
                                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        {result.image ? (
                                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                                                <Image
                                                    src={result.image}
                                                    alt={result.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
                                                <Search className="h-5 w-5 text-neutral-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate font-medium text-primary-950 dark:text-primary-50">
                                                {decodeHtmlEntities(result.name)}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                                                    {result.price} SEK
                                                </p>
                                                {result.categories.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {decodeHtmlEntities(result.categories[0])}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && query.length >= 2 && results.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    No results found for &quot;{query}&quot;
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Try different keywords or browse our menu
                                </p>
                            </div>
                        )}

                        {/* Recent Searches */}
                        {!query && recentSearches.length > 0 && (
                            <div className="border-t p-2">
                                <div className="mb-2 flex items-center justify-between px-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Recent Searches
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearRecentSearches}
                                        className="h-auto p-0 text-xs text-neutral-500 hover:text-neutral-700"
                                    >
                                        Clear
                                    </Button>
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(search);
                                            handleSearch(search);
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <Clock className="h-4 w-4 text-neutral-400" />
                                        <span className="text-sm">{search}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trending Searches */}
                        {!query && showTrending && (
                            <div className="border-t p-2">
                                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Trending Searches
                                </p>
                                <div className="flex flex-wrap gap-2 px-2">
                                    {trendingSearches.map((trend) => (
                                        <button
                                            key={trend}
                                            onClick={() => {
                                                setQuery(trend);
                                                handleSearch(trend);
                                            }}
                                            className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                        >
                                            <TrendingUp className="h-3 w-3" />
                                            {trend}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
