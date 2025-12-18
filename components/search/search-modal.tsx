'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
    id: number;
    name: string;
    slug: string;
    price: string;
    image?: string;
    categories: string[];
    relevance: number;
}

export function SearchModal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Keyboard shortcut to open search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Load recent searches
    useEffect(() => {
        const saved = localStorage.getItem('recent-searches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Search functionality
    useEffect(() => {
        if (!isOpen || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setSearchResults(data.results || []);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    const handleSearch = (query: string) => {
        if (!query.trim()) return;

        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent-searches', JSON.stringify(updated));

        router.push(`/shop?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setSearchQuery('');
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recent-searches');
    };

    const trendingSearches = ['Biryani', 'Samosa', 'Gulab Jamun', 'Tandoori', 'Curry'];

    return (
        <>
            {/* Search Trigger Button - Centered */}
            <div className="w-full flex justify-center">
                <button
                    type="button"
                    className="relative h-10 w-full max-w-md flex items-center justify-start text-sm text-muted-foreground bg-background border border-border hover:bg-muted hover:border-primary/30 transition-all duration-300 rounded-full shadow-sm px-3"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[SearchModal] Button clicked!');
                        setIsOpen(true);
                    }}
                >
                    <Search className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                    <span className="hidden sm:inline-flex text-foreground/70">Search products...</span>
                    <span className="inline-flex sm:hidden text-foreground/70">Search...</span>
                    <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded-md border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
            </div>

            {/* Search Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal - Centered with solid background */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-[90%] max-w-xl mx-auto"
                        >
                            <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
                                {/* Search Input Header */}
                                <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/50">
                                    <Search className="h-5 w-5 text-primary shrink-0" />
                                    <Input
                                        placeholder="Search for dishes, ingredients, or cuisines..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch(searchQuery);
                                            }
                                        }}
                                        className="flex-1 border-none bg-transparent px-0 py-1 text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
                                        autoFocus
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Results Area */}
                                <div className="max-h-[50vh] overflow-y-auto p-4 bg-background">
                                    {/* Loading State */}
                                    {isSearching && (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    )}

                                    {/* Search Results */}
                                    {!isSearching && searchResults.length > 0 && (
                                        <div>
                                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                                                Results
                                            </p>
                                            <div className="space-y-2">
                                                {searchResults.map((result) => (
                                                    <Link
                                                        key={result.id}
                                                        href={`/product/${result.slug}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-muted group border border-border"
                                                    >
                                                        {result.image ? (
                                                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                                                                <Image
                                                                    src={result.image}
                                                                    alt={result.name}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="48px"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                                                                <Search className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors text-sm">
                                                                {decodeHtmlEntities(result.name)}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-sm font-bold text-primary">
                                                                    {result.price} SEK
                                                                </p>
                                                                {result.categories.length > 0 && (
                                                                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                                                        {decodeHtmlEntities(result.categories[0])}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results */}
                                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                        <div className="py-12 text-center">
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                                <Search className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                No results found for &quot;{searchQuery}&quot;
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Try searching for something else
                                            </p>
                                        </div>
                                    )}

                                    {/* Recent & Trending (Show when no search query) */}
                                    {!searchQuery && (
                                        <div className="space-y-6">
                                            {/* Recent Searches */}
                                            {recentSearches.length > 0 && (
                                                <div>
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            Recent
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={clearRecentSearches}
                                                            className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                                        >
                                                            Clear
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-1">
                                                        {recentSearches.map((search, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => {
                                                                    setSearchQuery(search);
                                                                    handleSearch(search);
                                                                }}
                                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all hover:bg-muted group"
                                                            >
                                                                <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                <span className="text-foreground/80 group-hover:text-foreground">{search}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Trending Searches */}
                                            <div>
                                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">
                                                    Trending Now
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {trendingSearches.map((trend) => (
                                                        <button
                                                            key={trend}
                                                            onClick={() => {
                                                                setSearchQuery(trend);
                                                                handleSearch(trend);
                                                            }}
                                                            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                                                        >
                                                            <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                                                            {trend}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
