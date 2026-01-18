/**
 * Add Swetha-Telugu Foods Products to WooCommerce
 * Creates products from CSV data as drafts
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
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}

// Helper to create SEO-friendly slug
function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/swetha-te[ug]+u/gi, 'swetha-telugu') // Normalize brand name
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Helper to optimize product title for SEO
function optimizeTitle(description) {
    // Remove redundant brand prefix and clean up
    let title = description
        .replace(/^Swetha-Te[ug]+u\s+Foods?\s*/i, 'Swetha-Telugu Foods ')
        .trim();

    // Ensure it's not too long (max 60 chars for SEO)
    if (title.length > 60) {
        title = title.substring(0, 57) + '...';
    }

    return title;
}

// Generate short description
function generateShortDescription(title) {
    const product = title.replace('Swetha-Telugu Foods ', '');
    return `Premium organic ${product} from Swetha-Telugu Foods. Authentic South Indian product available at Ideal Indiska Livs Stockholm.`;
}

// Generate long description
function generateLongDescription(title, sku) {
    const product = title.replace('Swetha-Telugu Foods ', '');
    const productType = getProductType(title);

    let description = `<h2>About ${product}</h2>\n\n`;
    description += `<p>${getProductInfo(productType, product)}</p>\n\n`;
    description += `<h3>Usage & Benefits</h3>\n`;
    description += `<p>${getUsageInfo(productType)}</p>\n\n`;
    description += `<h3>Why Choose Swetha-Telugu Foods?</h3>\n`;
    description += `<p>Swetha-Telugu Foods brings you authentic South Indian products made with natural and organic ingredients. Each product is carefully selected to maintain traditional flavors while meeting modern quality standards.</p>\n\n`;
    description += `<h3>Where to Find</h3>\n`;
    description += `<p>Available at <strong>Ideal Indiska Livs Stockholm</strong> - Your trusted Indian grocery store in Stockholm.</p>\n`;
    description += `<p>Visit us online at <a href="https://ideallivs.com">ideallivs.com</a> or at our store to explore our complete range of authentic Indian products.</p>\n`;
    description += `<p><strong>SKU:</strong> ${sku}</p>`;

    return description;
}

// Determine product type
function getProductType(title) {
    const lower = title.toLowerCase();
    if (lower.includes('rice') || lower.includes('ris')) return 'rice';
    if (lower.includes('millet')) return 'millet';
    if (lower.includes('pickle')) return 'pickle';
    if (lower.includes('dalia')) return 'dalia';
    if (lower.includes('salt')) return 'salt';
    if (lower.includes('sugar') || lower.includes('kalkandam')) return 'sugar';
    if (lower.includes('coconut')) return 'coconut';
    if (lower.includes('chilli') || lower.includes('chili')) return 'chilli';
    return 'specialty';
}

// Get product information
function getProductInfo(type, product) {
    const info = {
        rice: `This premium ${product} is a staple in South Indian cuisine, known for its exceptional quality and authentic taste. Carefully sourced and processed to retain natural nutrients and traditional flavor.`,
        millet: `${product} is an ancient grain that has been a part of traditional Indian diet for centuries. Rich in nutrients, gluten-free, and perfect for health-conscious individuals seeking organic alternatives.`,
        pickle: `${product} is a traditional South Indian condiment that adds authentic flavor to your meals. Made with carefully selected ingredients following time-honored recipes for that perfect tangy and spicy taste.`,
        dalia: `Roasted Dalia Splits are made from premium quality wheat, roasted to perfection. A nutritious and versatile ingredient used in traditional Indian breakfast dishes and savory preparations.`,
        salt: `Pure sea salt harvested naturally, free from additives and chemicals. Perfect for all your cooking needs while maintaining the authentic taste of traditional Indian cuisine.`,
        sugar: `Kalkandam (Rock Sugar Cubes) is a natural sweetener used in traditional South Indian cooking and beverages. Known for its pure, unrefined quality and health benefits.`,
        coconut: `Finely ground desiccated coconut powder made from premium quality coconuts. An essential ingredient in South Indian cooking, perfect for chutneys, curries, and desserts.`,
        chilli: `Guntur Red Chilli is renowned for its vibrant color, intense heat, and authentic flavor. Essential for traditional Indian cooking, these premium quality chillies add the perfect kick to your dishes.`,
        specialty: `This authentic ${product} brings traditional South Indian flavors to your kitchen. Made with natural ingredients and traditional methods for genuine taste.`
    };

    return info[type] || info.specialty;
}

// Get usage information
function getUsageInfo(type) {
    const usage = {
        rice: `Perfect for preparing traditional South Indian dishes like idli, dosa, biryani, and everyday meals. Cook with your favorite dal and vegetables for a wholesome, nutritious meal. Ideal for both daily cooking and special occasions.`,
        millet: `Use as a healthy substitute for rice or wheat in your daily meals. Perfect for making traditional dishes like millet upma, khichdi, or porridge. Can be used in both sweet and savory preparations. Soak before cooking for best results.`,
        pickle: `Serve as a condiment with rice, chapati, dosa, or any Indian meal. A small amount adds incredible flavor. Store in a cool, dry place and use a clean, dry spoon to maintain freshness.`,
        dalia: `Ideal for making nutritious breakfast porridge, khichdi, or upma. Can be cooked with vegetables for savory dishes or with milk and sugar for sweet preparations. Quick to cook and easy to digest.`,
        salt: `Use in all your cooking preparations for authentic taste. Perfect for seasoning curries, dal, vegetables, and all types of Indian dishes. Can also be used for pickling and preserving.`,
        sugar: `Use in traditional South Indian beverages, desserts, and religious offerings. Dissolves easily in hot drinks. Known for its cooling properties and used in Ayurvedic preparations.`,
        coconut: `Perfect for making coconut chutney, adding to curries, gravies, and desserts. Can be used in both sweet and savory dishes. Adds authentic South Indian flavor and richness to your cooking.`,
        chilli: `Use whole or crushed in curries, pickles, and spice blends. Add to tempering for dal and sambar. Essential for authentic South Indian and Andhra cuisine. Handle with care due to high heat level.`,
        specialty: `Follow traditional preparation methods for authentic results. Can be used in various South Indian recipes. Store in a cool, dry place to maintain freshness and quality.`
    };

    return usage[type] || usage.specialty;
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
        values.push(current.trim()); // Add last value

        if (values.length < 7 || !values[0]) continue; // Skip empty lines

        const product = {
            sku: values[0],
            description: values[1],
            price: parseFloat(values[2]) || 0,
            vat: parseFloat(values[3]) || 0.12,
            barcode: values[6],
            articleGroup: values[7] || '',
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

async function addProducts() {
    console.log('\n🌾 Adding Swetha-Telugu Foods Products to WooCommerce\n');
    console.log('═'.repeat(100));

    // Parse CSV
    const csvPath = path.join(__dirname, '..', 'Swetha-Telugu Foods Updated new.csv');
    const products = parseCSV(csvPath);

    console.log(`\n📦 Found ${products.length} products to add\n`);

    let created = 0;
    let failed = 0;
    const results = [];

    for (const product of products) {
        try {
            const title = optimizeTitle(product.description);
            const slug = createSlug(title);
            const shortDesc = generateShortDescription(title);
            const longDesc = generateLongDescription(title, product.sku);

            // Calculate sale price if promotion exists
            let salePrice = '';
            if (product.promoStart && product.promoEnd && product.promoDiscount > 0) {
                salePrice = (product.price - product.promoDiscount).toFixed(2);
            }

            console.log(`\n📦 Creating: ${title}`);
            console.log(`   SKU: ${product.sku}`);
            console.log(`   Price: ${product.price} kr${salePrice ? ` (Sale: ${salePrice} kr)` : ''}`);
            console.log(`   GTIN: ${product.barcode}`);

            const productData = {
                name: title,
                slug: slug,
                type: 'simple',
                status: 'draft',
                sku: product.sku,
                regular_price: product.price.toString(),
                description: longDesc,
                short_description: shortDesc,
                manage_stock: false,
                stock_status: 'instock',
                meta_data: [
                    {
                        key: '_wc_gtin',
                        value: product.barcode
                    }
                ]
            };

            // Add sale price if promotion exists
            if (salePrice) {
                productData.sale_price = salePrice;
                productData.date_on_sale_from = product.promoStart;
                productData.date_on_sale_to = product.promoEnd;
            }

            // Try to set reduced tax class
            try {
                productData.tax_class = 'reduced-rate';
            } catch (e) {
                // Ignore if tax class not available
            }

            const response = await wcApi('products', 'POST', productData);

            console.log(`   ✅ Created successfully! ID: ${response.id}`);
            created++;

            results.push({
                sku: product.sku,
                name: title,
                id: response.id,
                success: true,
            });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            failed++;

            results.push({
                sku: product.sku,
                name: product.description,
                success: false,
                error: error.message,
            });
        }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${created} products (as drafts)`);
    if (failed > 0) {
        console.log(`   ❌ Failed: ${failed} products`);
    }
    console.log('');

    if (created > 0) {
        console.log('✅ Products created successfully as DRAFTS:\n');
        results.filter(r => r.success).forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.name} (SKU: ${r.sku}, ID: ${r.id})`);
        });
        console.log('\n📝 Note: All products are in DRAFT status. Please review and assign:');
        console.log('   - Categories');
        console.log('   - Brand (Swetha-Telugu)');
        console.log('   - Product images');
        console.log('   - Tax class (if needed)');
        console.log('   Then publish when ready!');
        console.log('');
    }

    if (failed > 0) {
        console.log('❌ Failed products:\n');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.name} (SKU: ${r.sku}): ${r.error}`);
        });
        console.log('');
    }

    console.log('═'.repeat(100));
    console.log('✅ Done!\n');
}

addProducts().catch(console.error);
