'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, Filter, X, ArrowUpDown, Package } from 'lucide-react';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import type { ProductCategoryFull } from '@/types/woocommerce';
import type { ProductBrand } from '@/lib/woocommerce/brands';
import { useDebounce } from 'use-debounce';

// Helper to build category tree
type CategoryWithChildren = ProductCategoryFull & {
    children: CategoryWithChildren[];
};

function buildCategoryTree(categories: ProductCategoryFull[]): CategoryWithChildren[] {
    const categoryMap = new Map<number, CategoryWithChildren>();
    categories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });
    const rootCategories: CategoryWithChildren[] = [];
    categories.forEach((cat) => {
        const current = categoryMap.get(cat.id)!;
        if (cat.parent === 0) {
            rootCategories.push(current);
        } else {
            const parent = categoryMap.get(cat.parent);
            if (parent) parent.children.push(current);
            else rootCategories.push(current); // Fallback
        }
    });
    return rootCategories;
}

interface ShopTopBarProps {
    categories: ProductCategoryFull[];
    brands?: ProductBrand[];
    totalProducts: number;
    className?: string;
}

export function ShopTopBar({ categories, brands = [], totalProducts, className }: ShopTopBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
    const [isOpen, setIsOpen] = useState(false); // For mobile filters if needed

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams?.toString() || '');
            if (searchQuery) {
                params.set('search', searchQuery);
            } else {
                params.delete('search');
            }
            params.delete('page'); // Reset pagination when search changes
            router.push(`?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, router]); // Intentionally exclude searchParams to avoid infinite loop

    // Handle Sort
    const handleSort = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');

        // Handle price sorting specially
        if (value === 'price-asc') {
            params.set('orderby', 'price');
            params.set('order', 'asc');
        } else if (value === 'price-desc') {
            params.set('orderby', 'price');
            params.set('order', 'desc');
        } else {
            // For other sorts (date, popularity, etc.)
            params.set('orderby', value);
            params.delete('order'); // Let WooCommerce use default order
        }

        router.push(`?${params.toString()}`);
    };

    // Handle Category Click
    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('category', slug);
        params.delete('page');
        router.push(`?${params.toString()}`);
    };

    // Handle Brand Click
    const handleBrandClick = (slug: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('brand', slug);
        params.delete('page');
        router.push(`?${params.toString()}`);
    };

    // Organize Categories
    const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

    // Identify specific groups
    const riceCategory = categoryTree.find(c => c.slug.toLowerCase().includes('rice') || c.name.toLowerCase().includes('rice'));
    const flourCategory = categoryTree.find(c => c.slug.toLowerCase().includes('flour') || c.slug.toLowerCase().includes('atta') || c.name.toLowerCase().includes('flour'));
    const spicesCategory = categoryTree.find(c => c.slug.toLowerCase().includes('spices') || c.name.toLowerCase().includes('spices') || c.name.toLowerCase().includes('masala'));

    // "All Categories" is everything else (excluding Rice, Flour, Spices)
    const excludedIds = [riceCategory?.id, flourCategory?.id, spicesCategory?.id].filter(Boolean) as number[];
    const otherCategories = categoryTree.filter(c =>
        !excludedIds.includes(c.id) &&
        !c.name.toLowerCase().includes('uncategorized')
    );

    return (
        <div className={cn("w-full space-y-4 mb-8", className)}>
            {/* Glassmorphism Filter Container */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-card/30 dark:bg-neutral-900/30 backdrop-blur-lg p-4 rounded-xl border border-white/20 dark:border-white/10 shadow-lg">

                {/* Left: Category Filters (Collapsible/Dropdowns) */}
                <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">

                    {/* Shop by Brands Dropdown - Replaces simple link */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary min-w-[160px] justify-between">
                                <span className="flex items-center gap-2">
                                    <Package className="h-4 w-4 opacity-70" />
                                    Shop by Brand
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <div className="p-4 bg-muted/30 border-b border-border">
                                <h4 className="font-heading font-semibold">Select a Brand</h4>
                                <p className="text-xs text-muted-foreground">Filter products by brand</p>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-2">
                                {brands && brands.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-1">
                                        {brands.map((brand) => (
                                            <button
                                                key={brand.id}
                                                onClick={() => handleBrandClick(brand.slug)}
                                                className={cn(
                                                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted text-left",
                                                    searchParams?.get('brand') === brand.slug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                                                )}
                                            >
                                                <span>{decodeHtmlEntities(brand.name)}</span>
                                                {brand.count > 0 && (
                                                    <span className="text-xs bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                                                        {brand.count}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No brands available.
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-border bg-muted/30">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs h-8"
                                    onClick={() => router.push('/brands')}
                                >
                                    View All Brands Page
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                    {/* Rice Dropdown */}
                    {riceCategory && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                    {decodeHtmlEntities(riceCategory.name)} <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem onClick={() => handleCategoryClick(riceCategory.slug)} className="font-medium">
                                    All {decodeHtmlEntities(riceCategory.name)}
                                </DropdownMenuItem>
                                {riceCategory.children.length > 0 && <DropdownMenuSeparator />}
                                {riceCategory.children.map((child) => (
                                    <DropdownMenuItem key={child.id} onClick={() => handleCategoryClick(child.slug)}>
                                        {decodeHtmlEntities(child.name)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Flour Dropdown */}
                    {flourCategory && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                    {decodeHtmlEntities(flourCategory.name)} <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem onClick={() => handleCategoryClick(flourCategory.slug)} className="font-medium">
                                    All {decodeHtmlEntities(flourCategory.name)}
                                </DropdownMenuItem>
                                {flourCategory.children.length > 0 && <DropdownMenuSeparator />}
                                {flourCategory.children.map((child) => (
                                    <DropdownMenuItem key={child.id} onClick={() => handleCategoryClick(child.slug)}>
                                        {decodeHtmlEntities(child.name)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Spices Dropdown */}
                    {spicesCategory && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                    {decodeHtmlEntities(spicesCategory.name)} <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem onClick={() => handleCategoryClick(spicesCategory.slug)} className="font-medium">
                                    All {decodeHtmlEntities(spicesCategory.name)}
                                </DropdownMenuItem>
                                {spicesCategory.children.length > 0 && <DropdownMenuSeparator />}
                                {spicesCategory.children.map((child) => (
                                    <DropdownMenuItem key={child.id} onClick={() => handleCategoryClick(child.slug)}>
                                        {decodeHtmlEntities(child.name)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* All Categories Dropdown (Popover for multi-column) */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                All Categories <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px] p-6" align="start">
                            <div className="grid grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
                                {otherCategories.map((cat) => (
                                    <div key={cat.id} className="space-y-2">
                                        <h4
                                            className="font-medium text-primary cursor-pointer hover:underline"
                                            onClick={() => handleCategoryClick(cat.slug)}
                                        >
                                            {decodeHtmlEntities(cat.name)}
                                        </h4>
                                        {cat.children.length > 0 && (
                                            <ul className="space-y-1">
                                                {cat.children.map((child) => (
                                                    <li key={child.id}>
                                                        <button
                                                            onClick={() => handleCategoryClick(child.slug)}
                                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                                                        >
                                                            {decodeHtmlEntities(child.name)}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Center/Right: Search Bar + Sort (Inline on Mobile) */}
                <div className="flex items-center gap-2 w-full xl:flex-1">
                    {/* Search Bar - Smaller on Mobile */}
                    <div className="flex-1 xl:max-w-md relative">
                        <Search className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-7 lg:pl-9 h-8 lg:h-10 text-sm bg-background/50 border-primary/10 focus:border-primary/30 transition-all"
                        />
                    </div>

                    {/* Sort Filter - Inline on Mobile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5 lg:gap-2 text-muted-foreground hover:text-foreground h-8 lg:h-10 px-2 lg:px-3">
                                <ArrowUpDown className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                <span className="hidden sm:inline">Sort</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSort('date')}>Newest</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('popularity')}>Popularity</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('price-asc')}>Price: Low to High</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('price-desc')}>Price: High to Low</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Active Filters Display */}
            {(searchParams?.get('category') || searchParams?.get('brand')) && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active Filters:</span>

                    {searchParams?.get('category') && (
                        <Badge variant="secondary" className="gap-1 hover:bg-muted/80">
                            {categories.find(c => c.slug === searchParams.get('category'))?.name || searchParams.get('category')}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams?.toString() || '');
                                    params.delete('category');
                                    router.push(`?${params.toString()}`);
                                }}
                            />
                        </Badge>
                    )}

                    {searchParams?.get('brand') && (
                        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Brand: {brands?.find(b => b.slug === searchParams.get('brand'))?.name || searchParams.get('brand')}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams?.toString() || '');
                                    params.delete('brand');
                                    router.push(`?${params.toString()}`);
                                }}
                            />
                        </Badge>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => router.push('/shop')}
                    >
                        Clear All
                    </Button>
                </div>
            )}
        </div>
    );
}
