'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, ChefHat, Send, TrendingUp, Clock, Loader2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { searchKnowledgeBase, getGreeting } from '@/lib/knowledge-base';
import { FeedbackForm } from '@/components/ai/feedback-form';

interface SearchResult {
    id: number;
    name: string;
    slug: string;
    price: string;
    image?: string;
    categories: string[];
    relevance: number;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface UnifiedSearchChatProps {
    className?: string;
}

const PLACEHOLDER_TEXTS = [
    'Search for products...',
    'Ask for recommendations...',
    'What can I help you find?'
];

export function UnifiedSearchChat({ className }: UnifiedSearchChatProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'chat' | 'feedback'>('search');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Chat state
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: getGreeting(),
            timestamp: new Date(),
        },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Animated placeholder rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Load recent searches
    useEffect(() => {
        const saved = localStorage.getItem('recent-searches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Search functionality
    useEffect(() => {
        if (!isOpen || activeTab !== 'search' || searchQuery.length < 2) {
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
    }, [searchQuery, isOpen, activeTab]);

    const handleSearch = (query: string) => {
        if (!query.trim()) return;

        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent-searches', JSON.stringify(updated));

        router.push(`/shop?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = generateAIResponse(newUserMessage.content);
            const newAiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newAiMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const generateAIResponse = (input: string): string => {
        // Use knowledge base for intelligent responses
        const kbResponse = searchKnowledgeBase(input);
        return kbResponse.answer;
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recent-searches');
    };

    const saveChatLogs = async () => {
        // Only save if there are user messages (not just the welcome message)
        const userMessages = messages.filter(m => m.role === 'user');
        if (userMessages.length === 0) return;

        try {
            await fetch('/api/chat-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp.toISOString()
                    })),
                    metadata: {
                        page: window.location.pathname,
                        messageCount: messages.length,
                    }
                }),
            });
        } catch (error) {
            console.error('Failed to save chat logs:', error);
        }
    };

    // Save chat logs when dialog closes
    useEffect(() => {
        if (!isOpen && messages.length > 1) {
            saveChatLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, messages.length]);

    const trendingSearches = ['Biryani', 'Samosa', 'Gulab Jamun', 'Tandoori', 'Curry'];

    return (
        <>
            {/* Search Bar Trigger */}
            <div className={cn('relative w-full', className)} onClick={() => setIsOpen(true)}>
                <div className="relative cursor-pointer">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <div className="pl-10 pr-4 h-10 flex items-center rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:border-primary/30 transition-all duration-300">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={placeholderIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className="text-sm text-muted-foreground"
                            >
                                {PLACEHOLDER_TEXTS[placeholderIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <Sparkles className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-pulse pointer-events-none" />
                </div>
            </div>

            {/* Full Screen Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'chat' | 'feedback')} className="w-full flex-1 flex flex-col overflow-hidden">
                        {/* Header with Tabs */}
                        <div className="border-b bg-background/95 backdrop-blur-md p-4">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="search" className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    <span className="hidden sm:inline">Search</span>
                                </TabsTrigger>
                                <TabsTrigger value="chat" className="flex items-center gap-2">
                                    <ChefHat className="h-4 w-4" />
                                    <span className="hidden sm:inline">AI Chat</span>
                                </TabsTrigger>
                                <TabsTrigger value="feedback" className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Feedback</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Search Tab Input */}
                            {activeTab === 'search' && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search for dishes, ingredients, or cuisines..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch(searchQuery);
                                            }
                                        }}
                                        className="pl-10 pr-10"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSearchResults([]);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden min-h-0">
                            {/* Search Tab Content */}
                            <TabsContent value="search" className="h-full overflow-y-auto m-0 p-4 data-[state=active]:flex data-[state=active]:flex-col">
                                {/* Loading State */}
                                {isSearching && (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}

                                {/* Search Results */}
                                {!isSearching && searchResults.length > 0 && (
                                    <div>
                                        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            Results ({searchResults.length})
                                        </p>
                                        <div className="space-y-2">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={result.id}
                                                    href={`/product/${result.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                                                >
                                                    {result.image ? (
                                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                                                            <Image
                                                                src={result.image}
                                                                alt={result.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-muted">
                                                            <Search className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-foreground">
                                                            {decodeHtmlEntities(result.name)}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-sm font-semibold text-primary">
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
                                    </div>
                                )}

                                {/* No Results */}
                                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            No results found for &quot;{searchQuery}&quot;
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Try different keywords or browse our menu
                                        </p>
                                    </div>
                                )}

                                {/* Recent & Trending Searches */}
                                {!searchQuery && (
                                    <div className="space-y-6">
                                        {/* Recent Searches */}
                                        {recentSearches.length > 0 && (
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                        Recent Searches
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearRecentSearches}
                                                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                                <div className="space-y-1">
                                                    {recentSearches.map((search, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => {
                                                                setSearchQuery(search);
                                                                handleSearch(search);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                                                        >
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{search}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Trending Searches */}
                                        <div>
                                            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                Trending Searches
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {trendingSearches.map((trend) => (
                                                    <button
                                                        key={trend}
                                                        onClick={() => {
                                                            setSearchQuery(trend);
                                                            handleSearch(trend);
                                                        }}
                                                        className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-muted/80"
                                                    >
                                                        <TrendingUp className="h-3 w-3" />
                                                        {trend}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Chat Tab Content */}
                            <TabsContent value="chat" className="h-full flex flex-col m-0 data-[state=active]:flex overflow-hidden">
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/30 to-background p-4 min-h-0">
                                    <div className="flex flex-col gap-3">
                                        {messages.map((msg, index) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    "flex w-max max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-3 text-sm shadow-md",
                                                    msg.role === 'assistant'
                                                        ? "self-start rounded-tl-sm bg-muted text-foreground"
                                                        : "self-end rounded-tr-sm bg-primary text-primary-foreground font-medium"
                                                )}
                                            >
                                                <div
                                                    className="leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: msg.content
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                                            .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" class="underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity">$1</a>`)
                                                    }}
                                                />
                                                <span className="text-[10px] opacity-70">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </motion.div>
                                        ))}
                                        {isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="self-start rounded-2xl rounded-tl-sm bg-muted px-5 py-3 shadow-md"
                                            >
                                                <div className="flex gap-1.5">
                                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary" />
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="border-t bg-background p-4 flex-shrink-0">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Ask about our menu, reservations..."
                                            className="flex-1 rounded-full"
                                            disabled={isTyping}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 rounded-full"
                                            disabled={!chatInput.trim() || isTyping}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </TabsContent>

                            {/* Feedback Tab Content */}
                            <TabsContent value="feedback" className="h-full m-0 overflow-y-auto p-6 data-[state=active]:block">
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                                        <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">✓ Tab is Working!</h3>
                                        <p className="text-sm text-green-600 dark:text-green-400">If you see this, the feedback tab is rendering correctly.</p>
                                    </div>

                                    {/* Feedback Form */}
                                    <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
                                        <FeedbackForm
                                            onClose={() => setIsOpen(false)}
                                            onSuccess={() => {
                                                setTimeout(() => setActiveTab('chat'), 2000);
                                            }}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}
