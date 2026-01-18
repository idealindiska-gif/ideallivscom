/**
 * Add Ovaltine Product to WooCommerce
 * Creates single product as draft
 */

require('dotenv').config({ path: '.env.local' });

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

async function addOvaltineProduct() {
    console.log('\n🥛 Adding Ovaltine Product to WooCommerce\n');
    console.log('═'.repeat(100));

    const product = {
        sku: '292238',
        name: 'Ovaltine 300g',
        slug: 'ovaltine-300g',
        gtin: '7612100005569',
        price: '89.00'
    };

    // Generate descriptions
    const shortDescription = `Premium Ovaltine malted milk drink 300g. Nutritious and delicious beverage mix available at Ideal Indiska Livs Stockholm.`;

    const longDescription = `<h2>About Ovaltine 300g</h2>

<p>Ovaltine is a classic malted milk drink mix that has been trusted by families worldwide for generations. This 300g pack provides a nutritious and delicious beverage option for the whole family. Rich in essential vitamins and minerals, Ovaltine makes a perfect addition to milk for a wholesome drink any time of day.</p>

<h3>Usage & Benefits</h3>

<p>Simply mix 2-3 teaspoons of Ovaltine powder with hot or cold milk and stir well. Perfect for breakfast, as an evening beverage, or as a nutritious drink for children. Ovaltine can also be used to enhance the flavor of smoothies, milkshakes, and desserts. The malted flavor combines wonderfully with milk to create a creamy, satisfying drink that provides energy and nutrition.</p>

<h3>Why Choose Ovaltine?</h3>

<p>Ovaltine is made from quality ingredients including malt extract, milk, and cocoa. It's fortified with essential vitamins and minerals, making it more than just a tasty beverage - it's a nutritious choice for your family. The convenient powder format allows you to control the strength of flavor to suit your preference.</p>

<h3>Where to Find</h3>

<p>Available at <strong>Ideal Indiska Livs Stockholm</strong> - Your trusted grocery store in Stockholm for international and Indian products.</p>

<p>Visit us online at <a href="https://ideallivs.com">ideallivs.com</a> or at our store to explore our complete range of beverages, dairy products, and grocery items from around the world.</p>

<p><strong>SKU:</strong> ${product.sku}</p>`;

    try {
        console.log(`\n📦 Creating: ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Price: ${product.price} kr`);
        console.log(`   GTIN: ${product.gtin}`);

        const productData = {
            name: product.name,
            slug: product.slug,
            type: 'simple',
            status: 'draft',
            sku: product.sku,
            regular_price: product.price,
            description: longDescription,
            short_description: shortDescription,
            manage_stock: false,
            stock_status: 'instock',
            meta_data: [
                {
                    key: '_wc_gtin',
                    value: product.gtin
                }
            ]
        };

        // Try to set reduced tax class
        try {
            productData.tax_class = 'reduced-rate';
        } catch (e) {
            // Ignore if tax class not available
        }

        const response = await wcApi('products', 'POST', productData);

        console.log(`   ✅ Created successfully! ID: ${response.id}`);

        console.log('\n' + '═'.repeat(100));
        console.log('\n✅ Product created successfully as DRAFT:\n');
        console.log(`   ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   ID: ${response.id}`);
        console.log(`   Price: ${product.price} kr`);
        console.log('');
        console.log('📝 Note: Product is in DRAFT status. Please review and assign:');
        console.log('   - Category (Add milk product)');
        console.log('   - Brand (Ovaltine)');
        console.log('   - Product image');
        console.log('   - Tax class (if needed)');
        console.log('   Then publish when ready!');
        console.log('');
        console.log('═'.repeat(100));
        console.log('✅ Done!\n');

    } catch (error) {
        console.log(`\n❌ Failed to create product: ${error.message}\n`);
        console.log('═'.repeat(100));
        process.exit(1);
    }
}

addOvaltineProduct().catch(console.error);
