"use client";

import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "./mobile-sidebar-toggle";
import { CartIcon } from "@/components/cart/cart-icon";
import { UserNav } from "@/components/layout/user-nav";

export function ContentHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, toggle } = useSidebar();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 lg:top-[10px] z-30 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 h-14 gap-4 bg-white/70 backdrop-blur-md">

        {/* Search Bar - Center - Dominant */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Search for fresh produce, groceries, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-14 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white/80 hover:bg-white transition-all font-medium placeholder:text-muted-foreground/70"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-md text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Login/Signup & Cart - Right */}
        <div className="flex items-center gap-6 ml-4 shrink-0">

          {/* Language / Location (Optional implementation) */}
          <div className="hidden xl:flex flex-col items-end text-sm text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground"><span className="w-2 h-2 rounded-full bg-primary/80"></span> Deliver to</span>
            <span className="text-xs">Select Location</span>
          </div>

          <div className="h-8 w-px bg-border mx-2" />

          {/* User Nav */}
          <UserNav />

          {/* Cart */}
          <CartIcon />
        </div>
      </div>

      {/* Navigation Menu - Below Search Bar (Desktop Only) */}
      <div className="hidden lg:block border-t border-border/50">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-center gap-8 py-3">
            <Link
              href="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>

            {/* Delivery Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                Delivery Info
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    href="/delivery-information"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    Stockholm & Sweden Delivery
                  </Link>
                  <Link
                    href="/europe-delivery"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    Europe Delivery
                  </Link>
                  <Link
                    href="/delivery-goteborg-malmo"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    Göteborg & Malmö Delivery
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex flex-col bg-background">
        {/* Top Row: Menu, Logo, Cart */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          {/* Menu Button */}
          <button
            onClick={toggle}
            className="p-2 -ml-2 hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-28 h-14 sm:w-32 sm:h-16">
              <Image
                src="https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-black.png"
                alt="Ideal Livs"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Cart */}
          <CartIcon />
        </div>

        {/* Search Bar - Bottom Row */}
        <div className="px-4 py-3 bg-muted/20">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background shadow-sm"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
