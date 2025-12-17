# Grocery Store Template

A modern, product-focused headless WordPress template for grocery stores, built with Next.js 15, WooCommerce, and Tailwind CSS.

## Overview

This is a clean, non-branded template framework designed specifically for grocery store websites. Unlike restaurant templates, this focuses heavily on product display, categories, brands, and e-commerce functionality powered by WooCommerce.

## Key Features

- **Product-Focused Design**: Built around showcasing products with WooCommerce integration
- **Category & Brand Support**: Comprehensive category browsing and brand filtering
- **Modern Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Headless WordPress**: Fully decoupled WordPress backend with WooCommerce
- **Fast Performance**: Server-side rendering, image optimization, and caching
- **Payment Integration**: Stripe payment gateway pre-configured
- **Responsive Design**: Mobile-first, fully responsive UI components
- **SEO Optimized**: Built-in schema markup and meta tag management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: WordPress (headless), WooCommerce
- **Payments**: Stripe
- **Forms**: React Hook Form, Zod validation
- **State Management**: Zustand
- **Animations**: Framer Motion

## Project Structure

```
grocery-template/
├── app/              # Next.js app directory (routes & pages)
├── components/       # Reusable UI components
├── lib/              # Utility functions and helpers
├── libschema/        # Schema definitions for structured data
├── types/            # TypeScript type definitions
├── store/            # Zustand state management
├── config/           # Configuration files
├── public/           # Static assets
├── site.config.ts    # Site-wide configuration
└── menu.config.ts    # Navigation menu configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- A WordPress site with WooCommerce installed
- WordPress plugins: Fourlines MCP (for API access)

### Installation

1. **Clone/Copy this template**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your:
   - WordPress URL
   - WooCommerce API credentials
   - Fourlines MCP API key
   - Stripe keys
   - Email configuration

4. **Update site configuration**

   Edit `site.config.ts` with your store details:
   ```typescript
   export const siteConfig = {
     site_name: "Your Store Name",
     site_description: "Your store description",
     site_domain: "https://yourstore.com",
     site_tagline: "Your tagline",
   };
   ```

5. **Customize navigation**

   Edit `menu.config.ts` to match your store structure

6. **Run development server**
   ```bash
   pnpm dev
   ```

7. **Open browser**

   Visit `http://localhost:3000`

## Customization for Your Store

### Brand Identity

1. Replace logo in `public/logo.svg`
2. Update colors in `tailwind.config.ts`
3. Modify site config in `site.config.ts`
4. Customize navigation in `menu.config.ts`

### Product Categories & Structure

The template is designed to work with WooCommerce product categories, tags, and custom taxonomies (like brands). Configure these in your WordPress admin.

### Pages & Routes

- `/` - Homepage with featured products
- `/shop` - All products
- `/shop/categories` - Browse by category
- `/brands` - Browse by brand
- `/deals` - Special offers and deals
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/about` - About page
- `/contact` - Contact page

## Key Differences from Restaurant Template

- **No menu/lunch-buffet/catering/reservations**: Removed restaurant-specific features
- **Product-centric**: Focus on WooCommerce products, categories, and brands
- **E-commerce first**: Shopping cart, checkout, and product browsing prioritized
- **Brand taxonomy**: Support for product brands alongside categories
- **Deals/offers**: Special sections for promotions and deals

## WordPress Setup

### Required Plugins

1. **WooCommerce** - E-commerce functionality
2. **Fourlines MCP** - API access layer
3. **Headless Mode** - Disable WordPress frontend (optional)

### WooCommerce Configuration

1. Set up product categories
2. Add brand taxonomy (optional, via plugin like Perfect Brands)
3. Configure shipping methods
4. Set up tax rates
5. Enable REST API and generate keys

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js 15+ (Netlify, AWS, self-hosted, etc.)

## Environment Variables

See `.env.example` for complete list. Key variables:

- `NEXT_PUBLIC_WORDPRESS_URL` - Your WordPress site URL
- `WC_CONSUMER_KEY` - WooCommerce API consumer key
- `WC_CONSUMER_SECRET` - WooCommerce API consumer secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Support & Documentation

This is a template framework. Customize it for your specific grocery store needs.

## License

This template is provided as-is for commercial and personal use.
