"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromotionGrid() {
    return (
        <section className="w-full py-6 md:py-8">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Card 1: Sona Masoori Rice Promotion */}
                    <Link href="/shop" className="group">
                        <div className="relative overflow-hidden rounded-2xl shadow-sm group-hover:shadow-lg transition-all h-full">
                            <div className="relative aspect-[4/4] w-full">
                                <Image
                                    src="https://crm.ideallivs.com/wp-content/uploads/2025/05/sona-masoori-speical-promotion-price-web.jpg"
                                    alt="Sona Masoori Special Promotion"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    unoptimized
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Free Delivery in Selected Stockholm Areas */}
                    <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/20 shadow-sm group hover:shadow-md transition-all">
                        <div className="p-6 relative z-10 flex flex-col h-full justify-between min-h-[280px]">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase">
                                        Free Delivery
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-foreground">
                                    Free Delivery in Selected Areas
                                </h3>

                                <p className="text-base font-semibold text-primary">
                                    When you spend 500 SEK
                                </p>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-muted-foreground leading-relaxed">
                                            <span className="font-medium">Delivery Areas:</span>
                                            <br />
                                            Bandhagen, Hagsätra, Högdalen, Farsta, Enskede, Huddinge, Solna & Sundbyberg
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Shop Now <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
                    </div>

                    {/* Card 3: Europe-Wide Delivery via DHL */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm group hover:shadow-lg transition-all">
                        <div className="p-6 relative z-10 h-full flex flex-col justify-between min-h-[280px]">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="h-5 w-5 text-white" />
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 uppercase">
                                        Europe-Wide
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-white">
                                    We Deliver All Over Europe
                                </h3>

                                <div className="space-y-2">
                                    <p className="text-lg font-semibold text-white">
                                        No Minimum Required
                                    </p>

                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                            <span className="text-sm font-bold text-white">via DHL</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/80 mt-3">
                                        Fast and reliable shipping to your doorstep anywhere in Europe
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button size="sm" className="rounded-full bg-white text-blue-600 hover:bg-gray-100">
                                    Learn More <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-1/2 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl opacity-30"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
