/**
 * Fetch All WooCommerce Brands
 * Retrieves all brands with their descriptions and meta data
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://crm.ideallivs.com';
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET;

async function wcApi(endpoint, method = 'GET', data = null) {
    const url = new URL(`${WORDPRESS_URL}/wp-json/wc/v3/${endpoint}`);
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const options = {
        method,
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function fetchAllBrands() {
    console.log('\n🏷️  Fetching All WooCommerce Brands\n');
    console.log('═'.repeat(100));

    try {
        let allBrands = [];
        let page = 1;
        let hasMore = true;

        // Try to fetch brands - they might be under different endpoints
        // Common endpoints: products/brands, products/attributes/pa_brand/terms

        console.log('\n🔍 Trying to fetch brands...\n');

        // Try main brands endpoint
        try {
            while (hasMore) {
                const brands = await wcApi(`products/brands?per_page=100&page=${page}`);

                if (brands.length === 0) {
                    hasMore = false;
                } else {
                    allBrands = allBrands.concat(brands);
                    page++;
                }
            }
        } catch (error) {
            console.log('   ℹ️  /products/brands endpoint not available, trying alternative...');

            // Try as product attribute
            try {
                page = 1;
                hasMore = true;
                while (hasMore) {
                    const brands = await wcApi(`products/attributes/1/terms?per_page=100&page=${page}`);

                    if (brands.length === 0) {
                        hasMore = false;
                    } else {
                        allBrands = allBrands.concat(brands);
                        page++;
                    }
                }
            } catch (error2) {
                // Try to get all product attributes first
                console.log('   ℹ️  Fetching product attributes...');
                const attributes = await wcApi('products/attributes');
                console.log(`\n   Found ${attributes.length} product attributes:`);
                attributes.forEach(attr => {
                    console.log(`   - ${attr.name} (ID: ${attr.id}, Slug: ${attr.slug})`);
                });

                // Find brand attribute
                const brandAttr = attributes.find(attr =>
                    attr.slug === 'brand' ||
                    attr.slug === 'pa_brand' ||
                    attr.name.toLowerCase() === 'brand'
                );

                if (brandAttr) {
                    console.log(`\n   ✅ Found brand attribute: ${brandAttr.name} (ID: ${brandAttr.id})`);
                    page = 1;
                    hasMore = true;
                    while (hasMore) {
                        const brands = await wcApi(`products/attributes/${brandAttr.id}/terms?per_page=100&page=${page}`);

                        if (brands.length === 0) {
                            hasMore = false;
                        } else {
                            allBrands = allBrands.concat(brands);
                            page++;
                        }
                    }
                } else {
                    throw new Error('Could not find brand attribute');
                }
            }
        }

        console.log(`\n✅ Found ${allBrands.length} brands\n`);
        console.log('═'.repeat(100));

        // Display brands with details
        const brandData = [];

        console.log('\n📋 BRAND DETAILS:\n');

        for (const brand of allBrands) {
            console.log(`\n🏷️  ${brand.name} (ID: ${brand.id})`);
            console.log(`   Slug: ${brand.slug}`);
            console.log(`   Count: ${brand.count} products`);
            console.log(`   Description: ${brand.description ? `${brand.description.substring(0, 100)}...` : '❌ MISSING'}`);

            brandData.push({
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                description: brand.description || '',
                count: brand.count,
                hasDescription: !!brand.description
            });
        }

        // Save to JSON file
        const outputPath = path.join(__dirname, '..', 'brands-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(brandData, null, 2));

        console.log('\n' + '═'.repeat(100));
        console.log(`\n✅ Brand data saved to: brands-data.json`);

        // Summary
        const totalWithoutDesc = allBrands.filter(brand => !brand.description).length;
        const totalWithDesc = allBrands.filter(brand => brand.description).length;

        console.log('\n📊 SUMMARY:');
        console.log(`   Total Brands: ${allBrands.length}`);
        console.log(`   ✓ With Description: ${totalWithDesc}`);
        console.log(`   ❌ Missing Description: ${totalWithoutDesc}`);
        console.log('');
        console.log('═'.repeat(100));
        console.log('✅ Done!\n');

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

fetchAllBrands().catch(console.error);
