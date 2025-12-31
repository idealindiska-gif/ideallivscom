import "./globals.css";

import { Inter as FontSans, Montserrat as FontHeading } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TopInfoBar } from "@/components/layout/top-info-bar";
import { SchemaScript } from "@/lib/schema/schema-script";
import { websiteSchema } from "@/lib/schema";
import { GoogleTagManager, GoogleTagManagerNoScript, FacebookPixel } from "@/components/analytics";
import { VerticalSidebar } from "@/components/layout/vertical-sidebar";
import { ContentHeader } from "@/components/layout/content-header";
import { Footer } from "@/components/layout/footer";
import { GeoMetaTags } from "@/components/seo/geo-meta-tags";
import { HreflangTags } from "@/components/seo/hreflang-tags";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";
import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";
import { ExitSurveyWrapper } from "@/components/feedback/exit-survey-wrapper";

import { getProductCategories } from "@/lib/woocommerce";

import type { Metadata } from "next";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = FontHeading({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.site_name,
    template: `%s | ${siteConfig.site_name}`,
  },
  description: siteConfig.site_description,
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://crm.ideallivs.com/wp-content/uploads/2025/05/ideal-favicon.png",
    shortcut: "https://crm.ideallivs.com/wp-content/uploads/2025/05/ideal-favicon.png",
    apple: "https://crm.ideallivs.com/wp-content/uploads/2025/05/ideal-favicon.png",
  },
  verification: {
    google: "JHCIpEz_IWYNdnNQGCkUKVQ8tiUre1hcCOqcSNhKlmQ",
  },
  // OpenGraph with Swedish locale
  openGraph: {
    type: "website",
    locale: "sv_SE",
    alternateLocale: ["en_SE"],
    url: siteConfig.site_domain,
    siteName: siteConfig.site_name,
    title: siteConfig.site_name,
    description: siteConfig.site_description,
    images: [
      {
        url: "https://crm.ideallivs.com/wp-content/uploads/2025/07/ideal-indiska-livs-stockholm.jpg",
        width: 1200,
        height: 630,
        alt: "Ideal Indiska LIVS - Indian & Pakistani Groceries in Stockholm",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: siteConfig.site_name,
    description: siteConfig.site_description,
    images: ["https://crm.ideallivs.com/wp-content/uploads/2025/07/ideal-indiska-livs-stockholm.jpg"],
  },
  // Additional metadata
  keywords: [
    "Indian groceries Stockholm",
    "Pakistani groceries Sweden",
    "Indiska livsmedel Stockholm",
    "Halal mat Stockholm",
    "Basmati ris Sverige",
    "Asiatiska kryddor Stockholm",
    "Indian spices Sweden",
    "Halal meat Stockholm",
    "Bandhagen grocery",
    "Indian store Sweden",
  ],
  authors: [{ name: "Ideal Indiska LIVS" }],
  creator: "Ideal Indiska LIVS",
  publisher: "Ideal Indiska LIVS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Viewport configuration for mobile devices
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getProductCategories({ parent: 0 });

  return (
    <html lang="sv-SE" suppressHydrationWarning>
      <head>
        {/* Geo-Targeting Meta Tags */}
        <GeoMetaTags />

        {/* Hreflang Tags */}
        <HreflangTags canonicalUrl={siteConfig.site_domain} />

        {/* Google Tag Manager */}
        <GoogleTagManager />
      </head>
      <body className={cn("min-h-screen font-sans antialiased", fontSans.variable, fontHeading.variable)} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript />

        {/* Facebook Pixel */}
        <FacebookPixel />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Top Green Info Bar - Desktop only */}
          <TopInfoBar />

          {/* Main Layout Container */}
          <div className="flex min-h-screen lg:min-h-[calc(100vh-40px)] overflow-x-hidden">
            {/* Vertical Sidebar - Fixed on left, hidden on mobile */}
            <VerticalSidebar categories={categories} />

            {/* Main Content Area - Responsive margin */}
            <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden max-w-full">
              {/* Content Header - Search, Login, Cart */}
              <ContentHeader />

              {/* Page Content */}
              <main className="flex-1 w-full overflow-x-hidden">{children}</main>
              <Footer />
            </div>
          </div>

          <CartDrawer />
          <WishlistDrawer />
          <ExitSurveyWrapper />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <AiChatWidget />

        {/* Global WebSite Schema */}
        <SchemaScript
          id="website-schema"
          schema={websiteSchema({
            name: siteConfig.site_name,
            url: siteConfig.site_domain,
            description: siteConfig.site_description,
            searchUrl: `${siteConfig.site_domain}/shop`,
          })}
        />
      </body>
    </html>
  );
}
