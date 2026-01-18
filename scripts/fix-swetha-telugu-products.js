/**
 * Fix Swetha-Telugu Foods Products
 * Updates GTIN and sale price for already created products
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

// Parse CSV data with proper handling of quoted fields
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        // Parse CSV line handling quoted fields
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        if (values.length < 7 || !values[0]) continue;

        const product = {
            sku: values[0],
            description: values[1],
            price: parseFloat(values[2]) || 0,
            barcode: values[6],
            promoStart: values[8] || '',
            promoEnd: values[9] || '',
            promoDiscount: parseFloat(values[10]) || 0
        };

        if (product.sku && product.description && product.price) {
            products.push(product);
        }
    }

    return products;
}

async function fixProducts() {
    console.log('\n🔧 Fixing Swetha-Telugu Foods Products\n');
    console.log('═'.repeat(100));

    // Parse CSV to get correct data
    const csvPath = path.join(__dirname, '..', 'Swetha-Telugu Foods Updated new.csv');
    const products = parseCSV(csvPath);

    console.log(`\n📦 Found ${products.length} products in CSV\n`);

    // Product IDs from the creation output
    const productMappings = [
        { sku: '122267', id: 5024 },
        { sku: '122276', id: 5025 },
        { sku: '1122106', id: 5026 },
        { sku: '1122107', id: 5027 },
        { sku: '1922107', id: 5028 },
        { sku: '1922108', id: 5029 },
        { sku: '1922109', id: 5030 },
        { sku: '2122209', id: 5031 },
        { sku: '16222145', id: 5032 },
        { sku: '16222146', id: 5033 },
        { sku: '16222147', id: 5034 },
        { sku: '16222148', id: 5035 },
    ];

    let updated = 0;
    let failed = 0;

    for (const mapping of productMappings) {
        const csvProduct = products.find(p => p.sku === mapping.sku);
        if (!csvProduct) {
            console.log(`\n⚠️  SKU ${mapping.sku} not found in CSV, skipping...`);
            continue;
        }

        try {
            console.log(`\n🔧 Updating: ${csvProduct.description} (ID: ${mapping.id})`);
            console.log(`   SKU: ${csvProduct.sku}`);
            console.log(`   GTIN: ${csvProduct.barcode}`);

            const updateData = {
                meta_data: [
                    {
                        key: '_wc_gtin',
                        value: csvProduct.barcode
                    }
                ]
            };

            // Fix sale price for promotional product
            if (csvProduct.promoStart && csvProduct.promoEnd && csvProduct.promoDiscount > 0) {
                const salePrice = (csvProduct.price - csvProduct.promoDiscount).toFixed(2);
                console.log(`   Sale: ${csvProduct.price} kr - ${csvProduct.promoDiscount} kr = ${salePrice} kr`);
                console.log(`   Period: ${csvProduct.promoStart} to ${csvProduct.promoEnd}`);

                updateData.sale_price = salePrice;
                updateData.date_on_sale_from = csvProduct.promoStart;
                updateData.date_on_sale_to = csvProduct.promoEnd;
            }

            await wcApi(`products/${mapping.id}`, 'PUT', updateData);

            console.log(`   ✅ Updated successfully!`);
            updated++;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully updated: ${updated} products`);
    if (failed > 0) {
        console.log(`   ❌ Failed: ${failed} products`);
    }
    console.log('');
    console.log('═'.repeat(100));
    console.log('✅ Done!\n');
}

fixProducts().catch(console.error);
