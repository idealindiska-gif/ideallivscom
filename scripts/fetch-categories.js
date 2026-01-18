/**
 * Fetch All WooCommerce Categories
 * Retrieves all categories with their descriptions and meta data
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

async function fetchAllCategories() {
    console.log('\n📂 Fetching All WooCommerce Categories\n');
    console.log('═'.repeat(100));

    try {
        let allCategories = [];
        let page = 1;
        let hasMore = true;

        // Fetch all categories with pagination
        while (hasMore) {
            const categories = await wcApi(`products/categories?per_page=100&page=${page}`);

            if (categories.length === 0) {
                hasMore = false;
            } else {
                allCategories = allCategories.concat(categories);
                page++;
            }
        }

        console.log(`\n✅ Found ${allCategories.length} categories\n`);

        // Organize categories
        const parentCategories = allCategories.filter(cat => cat.parent === 0);
        const childCategories = allCategories.filter(cat => cat.parent !== 0);

        console.log(`   📁 Parent Categories: ${parentCategories.length}`);
        console.log(`   📁 Child Categories: ${childCategories.length}\n`);

        console.log('═'.repeat(100));

        // Display categories with details
        const categoryData = [];

        console.log('\n📋 CATEGORY DETAILS:\n');

        for (const parent of parentCategories) {
            const children = childCategories.filter(cat => cat.parent === parent.id);

            console.log(`\n${'▶'.repeat(1)} PARENT: ${parent.name} (ID: ${parent.id})`);
            console.log(`   Slug: ${parent.slug}`);
            console.log(`   Count: ${parent.count} products`);
            console.log(`   Description: ${parent.description ? `${parent.description.substring(0, 100)}...` : '❌ MISSING'}`);

            const parentData = {
                id: parent.id,
                name: parent.name,
                slug: parent.slug,
                parent: 0,
                description: parent.description || '',
                count: parent.count,
                hasDescription: !!parent.description,
                children: []
            };

            if (children.length > 0) {
                console.log(`   └─ Child categories: ${children.length}`);

                for (const child of children) {
                    console.log(`      ├─ ${child.name} (ID: ${child.id}, Slug: ${child.slug})`);
                    console.log(`         Products: ${child.count}, Description: ${child.description ? '✓' : '❌ MISSING'}`);

                    parentData.children.push({
                        id: child.id,
                        name: child.name,
                        slug: child.slug,
                        parent: child.parent,
                        description: child.description || '',
                        count: child.count,
                        hasDescription: !!child.description
                    });
                }
            }

            categoryData.push(parentData);
        }

        // Save to JSON file
        const outputPath = path.join(__dirname, '..', 'categories-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(categoryData, null, 2));

        console.log('\n' + '═'.repeat(100));
        console.log(`\n✅ Category data saved to: categories-data.json`);

        // Summary
        const totalWithoutDesc = allCategories.filter(cat => !cat.description).length;
        const totalWithDesc = allCategories.filter(cat => cat.description).length;

        console.log('\n📊 SUMMARY:');
        console.log(`   Total Categories: ${allCategories.length}`);
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

fetchAllCategories().catch(console.error);
