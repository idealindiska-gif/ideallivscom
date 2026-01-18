/**
 * Optimize Remaining WooCommerce Categories
 * Updates child categories that already have descriptions but need SEO optimization
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
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// SEO data for remaining categories
const remainingCategories = {
    'fruit-pulps-canned-fruits': {
        description: 'Premium fruit pulps and canned fruits at Ideal Indiska Livs Stockholm. Shop mango pulp, alphonso pulp, and canned tropical fruits for lassi, desserts, and authentic Indian recipes.',
        metaTitle: 'Fruit Pulps & Canned Fruits | Mango Pulp Stockholm',
        metaDescription: 'Buy mango pulp, fruit pulps & canned fruits in Stockholm. Perfect for lassi & desserts at Ideal Indiska Livs.',
    },
    'food-colours-essences': {
        description: 'Edible food colors and essences at Ideal Indiska Livs Stockholm. Shop liquid food coloring, gel colors, rose essence, kewra essence, and vanilla extract for Indian sweets and baking.',
        metaTitle: 'Food Colors & Essences | Baking Essentials Stockholm',
        metaDescription: 'Buy food colors, rose essence & baking essences in Stockholm. Quality edible colors at Ideal Indiska Livs.',
    },
    'chapati-flour': {
        description: 'Premium chapati flour (roti atta) at Ideal Indiska Livs Stockholm. Finely milled whole wheat flour for soft, fluffy chapatis, rotis, and Indian flatbreads.',
        metaTitle: 'Chapati Flour | Roti Atta Stockholm',
        metaDescription: 'Buy chapati flour & roti atta in Stockholm. Premium wheat flour for soft rotis at Ideal Indiska Livs.',
    },
    'gram-flour': {
        description: 'Quality gram flour (besan) at Ideal Indiska Livs Stockholm. Fine chickpea flour for pakoras, laddoos, dhokla, kadhi, and traditional Indian cooking and sweets.',
        metaTitle: 'Gram Flour Besan | Chickpea Flour Stockholm',
        metaDescription: 'Buy gram flour (besan) & chickpea flour in Stockholm. Quality besan at Ideal Indiska Livs.',
    },
    'other-flours': {
        description: 'Specialty Indian flours at Ideal Indiska Livs Stockholm. Shop millet flour, corn flour, maida, rice flour, and regional flours for diverse Indian cooking and baking.',
        metaTitle: 'Specialty Flours | Millet, Corn, Rice Flour Stockholm',
        metaDescription: 'Buy specialty Indian flours, maida & rice flour in Stockholm at Ideal Indiska Livs.',
    },
    'whole-wheat-atta': {
        description: 'Premium whole wheat atta at Ideal Indiska Livs Stockholm. Traditional stone-ground and chakki-fresh atta from top brands like Aashirvaad and Pillsbury for authentic rotis.',
        metaTitle: 'Whole Wheat Atta | Premium Indian Atta Stockholm',
        metaDescription: 'Buy whole wheat atta from Aashirvaad & Pillsbury in Stockholm at Ideal Indiska Livs.',
    },
    'vegetables': {
        description: 'Fresh Indian vegetables at Ideal Indiska Livs Stockholm. Daily fresh produce including curry leaves, drumsticks, bitter gourd, okra, eggplant, and seasonal vegetables for authentic cooking.',
        metaTitle: 'Fresh Indian Vegetables | Curry Leaves, Okra Stockholm',
        metaDescription: 'Buy fresh Indian vegetables, curry leaves & drumsticks in Stockholm at Ideal Indiska Livs.',
    },
    'frozen-snacks': {
        description: 'Frozen Indian snacks at Ideal Indiska Livs Stockholm. Ready-to-fry samosas, spring rolls, cutlets, pakoras, and traditional snacks for quick entertaining and meals.',
        metaTitle: 'Frozen Indian Snacks | Samosas, Pakoras Stockholm',
        metaDescription: 'Buy frozen samosas, pakoras & Indian snacks in Stockholm at Ideal Indiska Livs.',
    },
    'almond-oil': {
        description: 'Pure almond oil for hair and skin at Ideal Indiska Livs Stockholm. Natural sweet almond oil rich in vitamins for hair growth, skin nourishment, and massage.',
        metaTitle: 'Almond Oil | Pure Sweet Almond Oil Stockholm',
        metaDescription: 'Buy pure almond oil for hair & skin care in Stockholm at Ideal Indiska Livs.',
    },
    'herbs-roots': {
        description: 'Ayurvedic herbs and roots at Ideal Indiska Livs Stockholm. Traditional medicinal herbs, dried roots, and herbal powders for wellness and natural remedies.',
        metaTitle: 'Ayurvedic Herbs & Roots | Herbal Remedies Stockholm',
        metaDescription: 'Buy Ayurvedic herbs, roots & natural remedies in Stockholm at Ideal Indiska Livs.',
    },
    'agarbatti': {
        description: 'Indian incense sticks (agarbatti) at Ideal Indiska Livs Stockholm. Shop sandalwood, jasmine, rose, and traditional fragrances from brands like Cycle, HEM, and Nag Champa.',
        metaTitle: 'Agarbatti Incense Sticks | Indian Incense Stockholm',
        metaDescription: 'Buy agarbatti incense sticks & Indian fragrances in Stockholm at Ideal Indiska Livs.',
    },
    'kitchen-accessories': {
        description: 'Indian kitchen accessories and utensils at Ideal Indiska Livs Stockholm. Shop tawa, pressure cookers, spice boxes, and traditional cooking tools for Indian kitchens.',
        metaTitle: 'Indian Kitchen Accessories | Cooking Utensils Stockholm',
        metaDescription: 'Buy Indian kitchen accessories & cooking utensils in Stockholm at Ideal Indiska Livs.',
    },
    'chick-peas': {
        description: 'Premium chickpeas (chana) at Ideal Indiska Livs Stockholm. White chickpeas, kabuli chana, and black chickpeas for chana masala, hummus, and traditional recipes.',
        metaTitle: 'Chickpeas Chana | Kabuli Chana Stockholm',
        metaDescription: 'Buy chickpeas (chana), kabuli chana & black chickpeas in Stockholm at Ideal Indiska Livs.',
    },
    'cooking-oil': {
        description: 'Indian cooking oils at Ideal Indiska Livs Stockholm. Shop mustard oil, coconut oil, sunflower oil, and vegetable oils for authentic Indian cooking and frying.',
        metaTitle: 'Cooking Oils | Mustard, Coconut Oil Stockholm',
        metaDescription: 'Buy Indian cooking oils, mustard & coconut oil in Stockholm at Ideal Indiska Livs.',
    },
    'pickles': {
        description: 'Authentic Indian pickles (achar) at Ideal Indiska Livs Stockholm. Shop mango pickle, lime pickle, mixed pickle, and regional varieties from top brands for traditional flavors.',
        metaTitle: 'Indian Pickles Achar | Mango, Lime Pickle Stockholm',
        metaDescription: 'Buy Indian pickles (achar), mango & lime pickle in Stockholm at Ideal Indiska Livs.',
    },
    'sauces': {
        description: 'Indian sauces and condiments at Ideal Indiska Livs Stockholm. Shop mint chutney, tamarind sauce, hot sauce, ketchup, and specialty sauces for authentic Indian taste.',
        metaTitle: 'Indian Sauces & Condiments | Chutneys Stockholm',
        metaDescription: 'Buy Indian sauces, chutneys & condiments in Stockholm at Ideal Indiska Livs.',
    },
    'cooked-boiled': {
        description: 'Canned cooked beans and lentils at Ideal Indiska Livs Stockholm. Ready-to-eat canned chickpeas, kidney beans, and lentils for quick curries and salads.',
        metaTitle: 'Canned Beans & Lentils | Ready-to-Eat Stockholm',
        metaDescription: 'Buy canned beans, chickpeas & cooked lentils in Stockholm at Ideal Indiska Livs.',
    },
    'asian-rice': {
        description: 'Asian rice varieties at Ideal Indiska Livs Stockholm. Shop jasmine rice, sushi rice, Thai rice, and specialty Asian rice for diverse cooking styles.',
        metaTitle: 'Asian Rice | Jasmine, Thai Rice Stockholm',
        metaDescription: 'Buy Asian rice, jasmine & Thai rice in Stockholm at Ideal Indiska Livs.',
    },
    'basmati-rice': {
        description: 'Premium basmati rice at Ideal Indiska Livs Stockholm. Aged authentic basmati from brands like India Gate, Kohinoor, and Tilda for perfect biryani, pulao, and everyday meals.',
        metaTitle: 'Basmati Rice | Premium Indian Basmati Stockholm',
        metaDescription: 'Buy premium basmati rice from India Gate & Tilda in Stockholm at Ideal Indiska Livs.',
    },
    'sona-masoori': {
        description: 'Sona Masoori rice at Ideal Indiska Livs Stockholm. Premium medium-grain rice from South India, perfect for daily meals, biryani, and traditional South Indian dishes.',
        metaTitle: 'Sona Masoori Rice | South Indian Rice Stockholm',
        metaDescription: 'Buy Sona Masoori rice & South Indian rice in Stockholm at Ideal Indiska Livs.',
    },
    'baby-care': {
        description: 'Natural baby care products at Ideal Indiska Livs Stockholm. Shop Himalaya baby products, Johnsons, and herbal baby care for gentle skin and hair care.',
        metaTitle: 'Baby Care Products | Natural Baby Care Stockholm',
        metaDescription: 'Buy natural baby care products & Himalaya baby range in Stockholm at Ideal Indiska Livs.',
    },
    'biscuits-cookies': {
        description: 'Indian biscuits and cookies at Ideal Indiska Livs Stockholm. Shop Parle-G, Marie biscuits, Britannia cookies, and traditional Indian snack biscuits for tea time.',
        metaTitle: 'Indian Biscuits & Cookies | Parle-G Stockholm',
        metaDescription: 'Buy Indian biscuits, Parle-G & cookies in Stockholm at Ideal Indiska Livs.',
    },
    'chips-crisps': {
        description: 'Indian chips and crisps at Ideal Indiska Livs Stockholm. Spicy potato chips, banana chips, tapioca chips, and savory Indian-style crisps for snacking.',
        metaTitle: 'Indian Chips & Crisps | Spicy Potato Chips Stockholm',
        metaDescription: 'Buy Indian chips, banana chips & savory crisps in Stockholm at Ideal Indiska Livs.',
    },
    'rusk': {
        description: 'Indian rusk (toast biscuits) at Ideal Indiska Livs Stockholm. Crispy twice-baked rusk from Britannia and local brands, perfect for dunking in tea and coffee.',
        metaTitle: 'Indian Rusk | Toast Biscuits Stockholm',
        metaDescription: 'Buy Indian rusk & toast biscuits in Stockholm at Ideal Indiska Livs.',
    },
    'ground-spices': {
        description: 'Ground Indian spices (pise masale) at Ideal Indiska Livs Stockholm. Shop turmeric powder, red chili powder, coriander powder, and pre-ground spices for easy cooking.',
        metaTitle: 'Ground Spices | Turmeric, Chili Powder Stockholm',
        metaDescription: 'Buy ground Indian spices, turmeric & chili powder in Stockholm at Ideal Indiska Livs.',
    },
    'hing': {
        description: 'Asafoetida (hing) at Ideal Indiska Livs Stockholm. Pure and compounded hing powder for tempering dals, adding flavor to vegetables, and traditional Indian cooking.',
        metaTitle: 'Hing Asafoetida | Indian Spice Stockholm',
        metaDescription: 'Buy hing (asafoetida) powder for Indian cooking in Stockholm at Ideal Indiska Livs.',
    },
    'salt-pepper': {
        description: 'Salt and pepper varieties at Ideal Indiska Livs Stockholm. Shop sea salt, black salt (kala namak), rock salt, black pepper, and specialty seasonings for Indian cooking.',
        metaTitle: 'Salt & Pepper | Black Salt, Sea Salt Stockholm',
        metaDescription: 'Buy Indian salt, kala namak & black pepper in Stockholm at Ideal Indiska Livs.',
    },
    'spice-blends': {
        description: 'Indian spice blends and masalas at Ideal Indiska Livs Stockholm. Shop garam masala, chaat masala, pav bhaji masala, and ready-made spice mixes from MDH, Everest, and Shan.',
        metaTitle: 'Spice Blends | Garam Masala, MDH Masala Stockholm',
        metaDescription: 'Buy spice blends, garam masala & Indian masalas in Stockholm at Ideal Indiska Livs.',
    },
    'whole-spices': {
        description: 'Whole Indian spices (sabut masale) at Ideal Indiska Livs Stockholm. Shop cumin seeds, cardamom, cinnamon, cloves, bay leaves, and whole spices for authentic flavors.',
        metaTitle: 'Whole Spices | Cumin, Cardamom, Cinnamon Stockholm',
        metaDescription: 'Buy whole Indian spices, cumin & cardamom in Stockholm at Ideal Indiska Livs.',
    },
    'dessert-mixes': {
        description: 'Indian dessert mixes at Ideal Indiska Livs Stockholm. Instant mixes for gulab jamun, kheer, halwa, rasgulla, and traditional Indian sweets. Quick and authentic.',
        metaTitle: 'Indian Dessert Mixes | Gulab Jamun, Kheer Mix Stockholm',
        metaDescription: 'Buy Indian dessert mixes, gulab jamun & kheer mix in Stockholm at Ideal Indiska Livs.',
    },
    'tradional-sweets': {
        description: 'Traditional Indian fried sweets and snacks at Ideal Indiska Livs Stockholm. Shop jalebi, imarti, sev, and authentic mithai for festivals and celebrations.',
        metaTitle: 'Traditional Indian Sweets | Mithai Stockholm',
        metaDescription: 'Buy traditional Indian sweets, jalebi & mithai in Stockholm at Ideal Indiska Livs.',
    },
    'tea': {
        description: 'Indian black tea and chai blends at Ideal Indiska Livs Stockholm. Shop Assam tea, Darjeeling tea, masala chai, and premium tea brands like Taj Mahal and Red Label.',
        metaTitle: 'Indian Tea & Chai | Masala Chai, Assam Tea Stockholm',
        metaDescription: 'Buy Indian tea, masala chai & Assam tea in Stockholm at Ideal Indiska Livs.',
    },
    'health-drinks-mixes': {
        description: 'Indian health drinks and nutrition mixes at Ideal Indiska Livs Stockholm. Shop Horlicks, Bournvita, Complan, protein drinks, and wellness beverages for all ages.',
        metaTitle: 'Health Drinks | Horlicks, Bournvita Stockholm',
        metaDescription: 'Buy Indian health drinks, Horlicks & Bournvita in Stockholm at Ideal Indiska Livs.',
    },
    'juices-soft-drinks': {
        description: 'Indian juices and soft drinks at Ideal Indiska Livs Stockholm. Shop mango juice, rose sherbet, masala soda, and imported Indian beverages for refreshing drinks.',
        metaTitle: 'Indian Juices & Drinks | Mango Juice Stockholm',
        metaDescription: 'Buy Indian juices, mango drink & soft drinks in Stockholm at Ideal Indiska Livs.',
    },
    'beard-colour': {
        description: 'Natural beard color products at Ideal Indiska Livs Stockholm. Herbal and chemical-free beard dyes for grooming and maintaining natural-looking facial hair color.',
        metaTitle: 'Beard Colour | Natural Beard Dye Stockholm',
        metaDescription: 'Buy natural beard colour & beard dye products in Stockholm at Ideal Indiska Livs.',
    },
    'hair-care': {
        description: 'Indian hair care products at Ideal Indiska Livs Stockholm. Shop hair oils, shampoos, conditioners, and herbal hair treatments from Dabur, Parachute, and Ayurvedic brands.',
        metaTitle: 'Indian Hair Care | Herbal Hair Products Stockholm',
        metaDescription: 'Buy Indian hair care, hair oils & herbal products in Stockholm at Ideal Indiska Livs.',
    },
};

async function optimizeRemainingCategories() {
    console.log('\n🔧 Optimizing Remaining Categories\n');
    console.log('═'.repeat(100));

    let updated = 0;
    let failed = 0;

    // Fetch all categories to get IDs
    let allCategories = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const categories = await wcApi(`products/categories?per_page=100&page=${page}`);
        if (categories.length === 0) {
            hasMore = false;
        } else {
            allCategories = allCategories.concat(categories);
            page++;
        }
    }

    console.log(`\n✅ Found ${allCategories.length} total categories\n`);

    for (const [slug, seoData] of Object.entries(remainingCategories)) {
        const category = allCategories.find(cat => cat.slug === slug);

        if (!category) {
            console.log(`\n⚠️  Category not found: ${slug}`);
            continue;
        }

        try {
            console.log(`\n📝 Updating: ${category.name} (ID: ${category.id})`);
            console.log(`   Slug: ${slug}`);

            const updateData = {
                description: seoData.description,
                yoast_head_json: {
                    title: seoData.metaTitle,
                    description: seoData.metaDescription,
                }
            };

            await wcApi(`products/categories/${category.id}`, 'PUT', updateData);

            console.log(`   ✅ Updated successfully!`);
            console.log(`   📝 Meta Title: ${seoData.metaTitle}`);
            console.log(`   📝 Meta Desc: ${seoData.metaDescription}`);
            updated++;

            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Successfully updated: ${updated} categories`);
    if (failed > 0) {
        console.log(`   ❌ Failed: ${failed} categories`);
    }
    console.log('');
    console.log('═'.repeat(100));
    console.log('✅ Done!\n');
}

optimizeRemainingCategories().catch(console.error);
