'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Menu,
    Phone,
    Home,
    ShoppingBag,
    BookOpen,
    Info,
    Mail,
    MapPin,
    Clock,
    Crown,
    Facebook,
    Instagram,
    Youtube,
    Percent,
    Heart
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { brandProfile } from '@/config/brand-profile';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from '@/components/ui/sheet';
import { getStoreStatus, type StoreStatus } from '@/lib/store-hours';

const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/deals', label: 'Deals & Offers', icon: Percent },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/brands', label: 'Shop by Brands', icon: ShoppingBag },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
    { href: '/my-account', label: 'My Account', icon: Crown },
    { href: '#wishlist', label: 'Wishlist (Coming Soon)', icon: Heart, comingSoon: true },
];

export function MobileMenu() {
    const [open, setOpen] = useState(false);
    const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);

    useEffect(() => {
        // Update store status on mount and every minute
        const updateStatus = () => setStoreStatus(getStoreStatus());
        updateStatus();

        const interval = setInterval(updateStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden hover:bg-primary/10 transition-all duration-300">
                    <Menu className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-[320px] sm:w-[380px] p-0 bg-gradient-to-br from-background via-background to-primary/5 border-l-2 border-primary/20"
            >
                {/* Header with Logo and Close Button */}
                <div className="relative overflow-hidden">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

                    <SheetHeader className="relative px-6 pt-4 pb-3 border-b border-primary/10">
                        <div className="flex items-center justify-center">
                            {/* Logo */}
                            <div className="relative h-20 w-32">
                                <Image
                                    src="https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-black.png"
                                    alt="Ideal Indiska LIVS"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-col gap-1 px-4 py-3 overflow-y-auto max-h-[calc(100vh-240px)]">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isComingSoon = item.comingSoon;

                        return (
                            <Link
                                key={item.href}
                                href={isComingSoon ? '#' : item.href}
                                onClick={(e) => {
                                    if (isComingSoon) {
                                        e.preventDefault();
                                    } else {
                                        setOpen(false);
                                    }
                                }}
                                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-foreground transition-all duration-300 ${isComingSoon
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                {/* Icon with gradient background */}
                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 ${!isComingSoon && 'group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110 group-hover:rotate-3'
                                    }`}>
                                    <Icon className={`h-5 w-5 text-primary transition-transform duration-300 ${!isComingSoon && 'group-hover:scale-110'}`} />
                                </div>

                                {/* Label */}
                                <span className="text-base font-medium tracking-wide">
                                    {item.label}
                                </span>

                                {/* Hover indicator */}
                                {!isComingSoon && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer with Contact Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent border-t border-primary/10">
                    {/* Phone Button */}
                    <a
                        href={`tel:${brandConfig.contact.phone}`}
                        className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-3 group"
                    >
                        <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
                            <Phone className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="text-base tracking-wide">{brandConfig.contact.phone}</span>
                    </a>

                    {/* Social Media Links */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        {brandConfig.social.facebook && (
                            <a
                                href={brandConfig.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-110 group"
                            >
                                <Facebook className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </a>
                        )}
                        {brandConfig.social.instagram && (
                            <a
                                href={brandConfig.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-110 group"
                            >
                                <Instagram className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </a>
                        )}
                        {brandConfig.social.youtube && (
                            <a
                                href={brandConfig.social.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-110 group"
                            >
                                <Youtube className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </a>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <a
                            href={brandConfig.contact.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-primary transition-colors duration-300"
                        >
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>Bandhagen</span>
                        </a>
                        <div className="w-1 h-1 rounded-full bg-primary/30" />
                        {storeStatus && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <span className={storeStatus.isOpen ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    {storeStatus.statusText}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
