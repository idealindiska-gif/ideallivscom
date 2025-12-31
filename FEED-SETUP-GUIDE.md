# Product Feeds Setup Guide

## Overview

This document explains how to set up and use the product feeds for Google Merchant Center and Pinterest. The feeds have been migrated from WordPress to Next.js API routes.

---

## Feed URLs

All feeds are now available at your main domain:

### Google Merchant Center Feeds

1. **Primary Product Feed (Europe-wide shipping)**
   - New URL: `https://www.ideallivs.com/api/google-products-feed`
   - Legacy URL: `https://www.ideallivs.com/google-products-feed.xml`
   - Both URLs work identically

2. **Local Inventory Feed (Sweden store)**
   - New URL: `https://www.ideallivs.com/api/google-local-inventory-feed`
   - Legacy URL: `https://www.ideallivs.com/google-local-inventory-feed.xml`
   - Both URLs work identically

### Pinterest / RSS Feed

3. **Blog RSS Feed**
   - New URL: `https://www.ideallivs.com/api/feed`
   - Legacy URL: `https://www.ideallivs.com/feed`
   - Both URLs work identically

---

## Google Merchant Center Setup

### 1. Access Google Merchant Center

Go to: https://merchants.google.com

### 2. Add Primary Product Feed

1. Navigate to **Products** > **Feeds**
2. Click **+ Create Feed**
3. Choose **Country of Sale**: Multiple countries (SE, NO, DK, FI, DE, NL, BE, FR, ES, IT, AT, PL)
4. Choose **Language**: Swedish (sv)
5. Choose **Destinations**: Shopping ads, Free listings
6. Click **Continue**

**Feed Details:**
- Feed name: `Ideal LIVS Primary Feed`
- Input method: **Scheduled fetch**
- Feed URL: `https://www.ideallivs.com/api/google-products-feed`
- Fetch frequency: **Daily** (recommended)
- Time zone: Stockholm (GMT+1)
- Preferred fetch time: 3:00 AM

7. Click **Create Feed**

### 3. Add Local Inventory Feed

1. Navigate to **Products** > **Feeds**
2. Click **+ Create Feed**
3. Choose **Feed Type**: Local product inventory
4. Choose **Country**: Sweden (SE)
5. Choose **Language**: Swedish (sv)
6. Click **Continue**

**Feed Details:**
- Feed name: `Ideal LIVS Local Inventory`
- Input method: **Scheduled fetch**
- Feed URL: `https://www.ideallivs.com/api/google-local-inventory-feed`
- Fetch frequency: **Daily**
- Time zone: Stockholm (GMT+1)
- Preferred fetch time: 3:00 AM

**Store Information:**
- Store code: `12397410391306859227`
- Store name: Ideal Indiska LIVS
- Address: Your physical store address in Stockholm
- Store pickup: Enabled
- Pickup SLA: Same day

7. Click **Create Feed**

### 4. Verify Feed Processing

- Wait 24-48 hours for initial processing
- Check **Products** > **Diagnostics** for any errors
- Common issues:
  - Missing GTIN: Products without GTIN use `identifier_exists: false`
  - Missing weight: Add product weights in WooCommerce
  - Image issues: Ensure all products have featured images

---

## Pinterest Setup

### 1. Access Pinterest Business Account

Go to: https://business.pinterest.com

### 2. Enable Catalogs

1. Click on **Ads** > **Catalogs**
2. Click **+ Create Catalog**
3. Choose **Retail**
4. Click **Continue**

### 3. Add Data Source

1. Catalog name: `Ideal LIVS Products`
2. Data source type: **Data feed**
3. Feed format: **RSS 2.0**
4. Feed URL: `https://www.ideallivs.com/api/feed`
5. Update frequency: **Daily**
6. Click **Save**

### 4. Configure Catalog

1. Choose **Feed Language**: Swedish
2. Choose **Country**: Sweden
3. Enable **Auto-publish**: Yes
4. Click **Done**

---

## Feed Features

### Primary Product Feed

✅ **Complete GTIN Detection**
- Checks 20+ meta fields for GTIN/EAN/UPC
- Falls back to `identifier_exists: false` when no GTIN

✅ **Availability Management**
- `in_stock`: Product available now
- `out_of_stock`: Not available
- `backorder`: Available for backorder (with availability_date)

✅ **Stockholm Shipping Logic**
- Free delivery: Orders ≥ 500 SEK
- Paid delivery (30 SEK): Orders 300-499 SEK
- DHL Europe-wide shipping for all other countries

✅ **Product Variants**
- Automatically includes all variations
- Each variant gets unique product ID
- Parent product name + variant attributes

✅ **Dynamic Pricing**
- Regular price + sale price support
- Automatic currency (SEK)

✅ **Weight & Shipping**
- Shipping weight from WooCommerce
- Unit pricing measure
- Weight-based DHL calculations

### Local Inventory Feed

✅ **Sweden Physical Store**
- Store code: 12397410391306859227
- Same-day pickup available
- Stock quantity tracking

✅ **On Display to Order (ODO)**
- Detects "Store Availability" attribute
- Sets availability: `on_display_to_order`
- Includes availability_date

✅ **Real-time Inventory**
- Syncs with WooCommerce stock
- Updates hourly (cache revalidation)

### RSS Feed (Pinterest)

✅ **Blog Posts**
- Fetches latest 50 posts from WordPress
- Includes featured images
- Full content with HTML formatting
- Author information
- Publication dates

---

## Cache & Performance

All feeds use Next.js caching:
- **Cache Duration**: 1 hour (3600 seconds)
- **Stale While Revalidate**: 2 hours (7200 seconds)
- This ensures:
  - Fast response times
  - Reduced API calls to WooCommerce
  - Fresh data every hour

---

## Testing Feeds

### Validate XML

1. **Google Merchant Feed Validator**
   - Go to: https://merchants.google.com
   - Products > Feeds > Feed name > View feed
   - Check for errors/warnings

2. **RSS Validator**
   - Go to: https://validator.w3.org/feed/
   - Enter: `https://www.ideallivs.com/api/feed`
   - Validate

### Manual Testing

```bash
# Test Google Product Feed
curl https://www.ideallivs.com/api/google-products-feed

# Test Local Inventory Feed
curl https://www.ideallivs.com/api/google-local-inventory-feed

# Test RSS Feed
curl https://www.ideallivs.com/api/feed
```

### Check Feed Headers

```bash
curl -I https://www.ideallivs.com/api/google-products-feed

# Should see:
# Content-Type: application/xml; charset=utf-8
# Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200
```

---

## Troubleshooting

### Feed Returns Empty or Error

**Check Environment Variables:**
```env
NEXT_PUBLIC_WOOCOMMERCE_API_URL=https://crm.ideallivs.com/wp-json/wc/v3
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
NEXT_PUBLIC_WORDPRESS_API_URL=https://crm.ideallivs.com/wp-json/wp/v2
```

### Products Missing from Feed

1. Verify product is **Published** in WooCommerce
2. Verify product has a **Price** > 0
3. Check product has **Stock Status** (instock/outofstock/onbackorder)
4. For variations: Parent product must be published

### GTIN Errors in Google Merchant

**Option 1:** Add GTIN to products
- Edit product in WooCommerce
- Add custom field: `_global_unique_id` with GTIN value

**Option 2:** Accept `identifier_exists: false`
- Google allows products without GTIN
- Feed automatically adds this tag when GTIN missing

### Weight Missing Warnings

1. Edit products in WooCommerce
2. Add **Weight** field (e.g., 500 for 500g)
3. Ensure **Weight Unit** in WooCommerce is set to `g` (grams)

---

## Feed Settings

### Customization

To modify feed settings, edit the API route files:

**Settings Location:**
- `app/api/google-products-feed/route.ts` (lines 9-14)
- `app/api/google-local-inventory-feed/route.ts` (lines 9-11)

**Configurable Settings:**
```typescript
const BRAND = 'Ideal Indiska Livs';
const STOCKHOLM_FREE_THRESHOLD = 500;      // SEK
const STOCKHOLM_DELIVERY_COST = 30;        // SEK
const STOCKHOLM_DELIVERY_MIN = 300;        // SEK
const STOCKHOLM_DELIVERY_MAX = 499;        // SEK
const STORE_CODE = '12397410391306859227'; // Google Merchant store code
```

After changing settings:
1. Save the file
2. Redeploy to Vercel (automatic on push)
3. Clear cache by waiting 1 hour or redeploying

---

## Comparison: WordPress vs Next.js

| Feature | WordPress (Old) | Next.js (New) |
|---------|----------------|---------------|
| Feed Location | Backend (crm.ideallivs.com) | Frontend (www.ideallivs.com) |
| Update Method | Cron job (hourly) | On-demand with 1-hour cache |
| Customization | WordPress admin UI | Code-based (TypeScript) |
| Performance | File-based (static XML) | API-based (dynamic + cached) |
| Maintenance | Plugin/snippet updates | Version controlled |
| URL Format | /wp-content/uploads/... | Clean URLs (/api/...) |

**Benefits of Next.js Feeds:**
- ✅ Feeds on main domain (better for SEO)
- ✅ Automatic updates when products change
- ✅ Version controlled (Git history)
- ✅ TypeScript type safety
- ✅ Integrated with existing Next.js app
- ✅ No WordPress admin access needed
- ✅ Faster response times (CDN caching)

---

## Monitoring

### Google Merchant Center

Check daily:
- Products > Diagnostics
- Feed processing status
- Error count
- Disapproved products

### Pinterest

Check weekly:
- Catalogs > Your catalog
- Processing status
- Active pins count

### Feed Performance

Monitor in Vercel:
- Analytics > Functions
- Check `/api/google-products-feed` response times
- Check error rates

---

## Support

For feed issues:
1. Check Vercel deployment logs
2. Validate XML format
3. Check WooCommerce product data
4. Review Google Merchant Center diagnostics

For questions:
- Google Merchant: https://support.google.com/merchants
- Pinterest: https://help.pinterest.com/en/business
- Next.js: https://nextjs.org/docs

---

## Migration Checklist

- [ ] Update Google Merchant Center feed URLs
- [ ] Update Pinterest catalog feed URL
- [ ] Test all feed URLs
- [ ] Validate XML format
- [ ] Wait 24-48 hours for processing
- [ ] Check for errors in Google Merchant Center
- [ ] Verify products appear in Google Shopping
- [ ] Check Pinterest pins are created
- [ ] Remove old WordPress snippet (optional)
- [ ] Monitor feed performance for 1 week

---

**Last Updated:** 2026-01-01
**Version:** 1.0
**Status:** ✅ Production Ready
