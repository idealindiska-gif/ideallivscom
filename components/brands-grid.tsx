"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductBrand {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    image?: {
        id: number;
        src: string;
        alt: string;
    };
}

interface BrandsGridProps {
    brands: ProductBrand[];
}

type FilterType = "all" | "indian" | "pakistani" | "international" | "popular";

const INDIAN_BRANDS = [
    "aashirvaad", "haldiram", "mtr", "mdh", "dabur", "parle", "lijjat",
    "priya", "bikano", "kurkure", "tata", "fortune", "pillsbury", "elephant",
    "deepak", "annam", "idhayam", "patanjli", "jabsons", "trs", "heera",
    "natco", "malik", "a1"
];

const PAKISTANI_BRANDS = [
    "shan", "national", "ahmed", "laziza", "shezan", "tapal", "lazzat",
    "qarshi", "shangrila"
];

export function BrandsGrid({ brands: initialBrands }: BrandsGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>("all");

    // Group brands alphabetically
    const brandsByLetter = useMemo(() => {
        const filtered = initialBrands.filter((brand) => {
            const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());

            if (filterType === "all") return matchesSearch;
            if (filterType === "popular") return matchesSearch && brand.count > 10;
            if (filterType === "indian") return matchesSearch && INDIAN_BRANDS.includes(brand.slug);
            if (filterType === "pakistani") return matchesSearch && PAKISTANI_BRANDS.includes(brand.slug);
            if (filterType === "international") {
                return matchesSearch &&
                    !INDIAN_BRANDS.includes(brand.slug) &&
                    !PAKISTANI_BRANDS.includes(brand.slug);
            }
            return matchesSearch;
        });

        const grouped = filtered.reduce((acc, brand) => {
            const letter = brand.name.charAt(0).toUpperCase();
            if (!acc[letter]) acc[letter] = [];
            acc[letter].push(brand);
            return acc;
        }, {} as Record<string, ProductBrand[]>);

        // Sort brands within each letter group
        Object.keys(grouped).forEach(letter => {
            grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
        });

        return grouped;
    }, [initialBrands, searchQuery, filterType]);

    const sortedLetters = Object.keys(brandsByLetter).sort();
    const totalProducts = initialBrands.reduce((sum, b) => sum + b.count, 0);
    const popularBrands = initialBrands.filter(b => b.count > 10);
    const filteredBrands = Object.values(brandsByLetter).flat();

    return (
        <div className="space-y-12">
            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {initialBrands.length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Total Brands</div>
                </div>
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {popularBrands.length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Popular Brands</div>
                </div>
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {totalProducts}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Total Products</div>
                </div>
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {INDIAN_BRANDS.filter(slug => initialBrands.find(b => b.slug === slug)).length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Indian Brands</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search brands (e.g., Shan, MDH, Haldiram)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                        variant={filterType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("all")}
                        className="rounded-full"
                    >
                        All Brands
                    </Button>
                    <Button
                        variant={filterType === "popular" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("popular")}
                        className="rounded-full"
                    >
                        Popular (10+ Products)
                    </Button>
                    <Button
                        variant={filterType === "indian" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("indian")}
                        className="rounded-full"
                    >
                        Indian Brands
                    </Button>
                    <Button
                        variant={filterType === "pakistani" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("pakistani")}
                        className="rounded-full"
                    >
                        Pakistani Brands
                    </Button>
                    <Button
                        variant={filterType === "international" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("international")}
                        className="rounded-full"
                    >
                        International
                    </Button>
                </div>

                {/* Results Count */}
                <p className="text-center text-sm text-muted-foreground">
                    Showing {filteredBrands.length} of {initialBrands.length} brands
                </p>
            </div>

            {/* A-Z Quick Jump Navigation */}
            {sortedLetters.length > 0 && (
                <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-y border-border py-3">
                    <div className="flex gap-1 justify-center flex-wrap max-w-4xl mx-auto">
                        {sortedLetters.map(letter => (
                            <a
                                key={letter}
                                href={`#letter-${letter}`}
                                className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {letter}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Brands Grid by Letter */}
            <TooltipProvider>
                <div className="space-y-12">
                    {sortedLetters.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                No brands found matching your criteria.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterType("all");
                                }}
                                className="mt-4"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        sortedLetters.map(letter => (
                            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                                {/* Letter Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-primary">{letter}</span>
                                        </div>
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {brandsByLetter[letter].length} {brandsByLetter[letter].length === 1 ? 'brand' : 'brands'}
                                        </span>
                                    </div>
                                </div>

                                {/* Brands Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                                    {brandsByLetter[letter].map((brand) => (
                                        <Tooltip key={brand.id}>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={`/brand/${brand.slug}`}
                                                    className="group"
                                                >
                                                    <article className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
                                                        {/* Brand Image/Logo */}
                                                        <div className="relative aspect-square bg-white flex items-center justify-center p-6 border-b border-border/50">
                                                            {brand.image?.src ? (
                                                                <Image
                                                                    src={brand.image.src}
                                                                    alt={brand.image.alt || brand.name}
                                                                    fill
                                                                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                                                                />
                                                            ) : (
                                                                <div className="text-center w-full">
                                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary font-bold text-2xl border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                                                                        {brand.name.charAt(0)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Brand Info */}
                                                        <div className="p-4 flex-1 flex flex-col text-center bg-card">
                                                            <h3 className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                                {brand.name}
                                                            </h3>

                                                            {brand.count > 0 && (
                                                                <p className="text-xs text-muted-foreground mt-auto">
                                                                    {brand.count} Product{brand.count !== 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </article>
                                                </Link>
                                            </TooltipTrigger>
                                            {brand.description && (
                                                <TooltipContent side="top" className="max-w-xs">
                                                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: brand.description.substring(0, 150) + (brand.description.length > 150 ? '...' : '') }} />
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </TooltipProvider>
        </div>
    );
}
