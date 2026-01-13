'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
    className?: string;
    variant?: 'default' | 'compact' | 'topbar';
}

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', shortName: 'EN' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪', shortName: 'SV' },
];

export function LanguageSwitcher({ className, variant = 'default' }: LanguageSwitcherProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Determine current locale from pathname
    const currentLocale = pathname.startsWith('/sv') ? 'sv' : 'en';
    const currentLanguage = languages.find(l => l.code === currentLocale) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const switchLanguage = (langCode: string) => {
        let newPath = pathname;

        if (langCode === 'sv') {
            // Switch to Swedish
            if (!pathname.startsWith('/sv')) {
                newPath = `/sv${pathname === '/' ? '' : pathname}`;
            }
        } else {
            // Switch to English (remove /sv prefix)
            if (pathname.startsWith('/sv')) {
                newPath = pathname.replace(/^\/sv/, '') || '/';
            }
        }

        // Set cookie for language preference
        document.cookie = `NEXT_LOCALE=${langCode};path=/;max-age=31536000`;

        router.push(newPath);
        setIsOpen(false);
    };

    if (variant === 'topbar') {
        return (
            <div className={cn("relative", className)} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md transition-colors border border-white/20"
                    aria-label="Switch language"
                >
                    <span className="text-sm">{currentLanguage.flag}</span>
                    <span className="text-xs font-semibold">{currentLanguage.shortName}</span>
                    <svg
                        className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 transition-colors",
                                    currentLocale === lang.code && "bg-primary/10 text-primary"
                                )}
                            >
                                <span>{lang.flag}</span>
                                <span className="text-gray-900">{lang.name}</span>
                                {currentLocale === lang.code && (
                                    <svg className="h-4 w-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={cn("relative", className)} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 p-2 rounded-full hover:bg-muted transition-colors"
                    aria-label="Switch language"
                >
                    <Globe className="h-5 w-5" />
                    <span className="text-xs font-medium">{currentLanguage.shortName}</span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-background rounded-lg shadow-lg border overflow-hidden z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors",
                                    currentLocale === lang.code && "bg-primary/10"
                                )}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                aria-label="Switch language"
            >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLanguage.name}</span>
                <span className="text-base">{currentLanguage.flag}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-background rounded-lg shadow-lg border overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors",
                                currentLocale === lang.code && "bg-primary/10 font-medium"
                            )}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.name}</span>
                            {currentLocale === lang.code && (
                                <svg className="h-4 w-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
